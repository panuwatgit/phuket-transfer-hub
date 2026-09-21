import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit

// ตัดฉากหลังด้วย Vision → หด mask ขอบเล็กน้อย (กันขอบดำ/แสงฉากหลังติดมา) → PNG โปร่งใส ครอปพอดี → ย่อไม่เกิน maxW
// usage: cutout <in> <out.png> [erodeRadius=2] [maxWidth=1000]
let a = CommandLine.arguments
let inURL = URL(fileURLWithPath: a[1]), outURL = URL(fileURLWithPath: a[2])
let erode = a.count > 3 ? Double(a[3]) ?? 2 : 2
let maxW = a.count > 4 ? Double(a[4]) ?? 1000 : 1000
guard let ci = CIImage(contentsOf: inURL)?.oriented(.up) else { fputs("cannot read\n", stderr); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: ci, options: [:])
try handler.perform([req])
guard let obs = req.results?.first else { fputs("no foreground found\n", stderr); exit(2) }
let maskBuf = try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler)
var mask = CIImage(cvPixelBuffer: maskBuf)
// scale mask to image size (Vision returns image-sized mask already, but be safe)
let sx = ci.extent.width / mask.extent.width, sy = ci.extent.height / mask.extent.height
mask = mask.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
if erode > 0 {
  let mn = CIFilter.morphologyMinimum(); mn.inputImage = mask; mn.radius = Float(erode); mask = mn.outputImage!
  let bl = CIFilter.gaussianBlur(); bl.inputImage = mask; bl.radius = 0.7; mask = bl.outputImage!.cropped(to: ci.extent)
}
let blend = CIFilter.blendWithMask()
blend.inputImage = ci
blend.backgroundImage = CIImage(color: .clear).cropped(to: ci.extent)
blend.maskImage = mask
var out = blend.outputImage!
// crop to opaque bounds
let ctx = CIContext()
guard let full = ctx.createCGImage(out, from: ci.extent) else { exit(3) }
let bmp = NSBitmapImageRep(cgImage: full)
var minX = full.width, minY = full.height, maxX = 0, maxY = 0
if let data = bmp.bitmapData {
  let bpr = bmp.bytesPerRow, spp = bmp.samplesPerPixel
  for y in 0..<full.height { for x in 0..<full.width { let alpha = data[y * bpr + x * spp + 3]; if alpha > 8 { if x < minX { minX = x }; if x > maxX { maxX = x }; if y < minY { minY = y }; if y > maxY { maxY = y } } } }
}
let pad = 6
let cropRect = CGRect(x: max(0, minX - pad), y: max(0, full.height - 1 - maxY - pad), width: min(full.width, maxX - minX + 1 + pad * 2), height: min(full.height, maxY - minY + 1 + pad * 2))
out = out.cropped(to: cropRect)
if cropRect.width > maxW { let s = maxW / cropRect.width; out = out.transformed(by: CGAffineTransform(scaleX: s, y: s)) }
guard let cg = ctx.createCGImage(out, from: out.extent) else { exit(4) }
let rep = NSBitmapImageRep(cgImage: cg)
guard let png = rep.representation(using: .png, properties: [:]) else { exit(5) }
try png.write(to: outURL)
print("ok \(cg.width)x\(cg.height)")
