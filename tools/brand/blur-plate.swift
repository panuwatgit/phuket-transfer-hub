import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit

// เบลอป้ายทะเบียน: หาข้อความที่เป็นตัวเลข 3–4 หลัก (เลขทะเบียน) ด้วย Vision แล้ว pixelate กรอบนั้น (ขยายให้คลุมทั้งป้าย)
// usage: blur-plate <in.png> <out.png> [padX=0.35] [padY=0.9]
let a = CommandLine.arguments
let inURL = URL(fileURLWithPath: a[1]), outURL = URL(fileURLWithPath: a[2])
let padX = a.count > 3 ? Double(a[3]) ?? 0.35 : 0.35
let padY = a.count > 4 ? Double(a[4]) ?? 0.9 : 0.9
guard let ci = CIImage(contentsOf: inURL) else { fputs("cannot read\n", stderr); exit(1) }
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.recognitionLanguages = ["th-TH", "en-US"]
let handler = VNImageRequestHandler(ciImage: ci, options: [:])
try handler.perform([req])
let W = ci.extent.width, H = ci.extent.height
var boxes: [CGRect] = []
for o in req.results ?? [] {
  guard let top = o.topCandidates(1).first else { continue }
  let digits = top.string.filter { $0.isNumber }.count
  if digits >= 3 && digits <= 8 { // ป้ายทะเบียนไทยมักอ่านได้ 4–7 หลัก (รวมเลขที่ OCR เพี้ยน)
    let b = o.boundingBox // normalized, origin bottom-left
    var r = CGRect(x: b.minX * W, y: b.minY * H, width: b.width * W, height: b.height * H)
    r = r.insetBy(dx: -r.width * padX, dy: -r.height * padY)
    boxes.append(r.intersection(ci.extent))
    print("plate text: \(top.string) box: \(Int(r.minX)),\(Int(r.minY)) \(Int(r.width))x\(Int(r.height))")
  }
}
if boxes.isEmpty { fputs("no plate-like text found\n", stderr); exit(2) }
let px = CIFilter.pixellate(); px.inputImage = ci; px.scale = Float(max(8, W / 70)); px.center = CGPoint(x: W / 2, y: H / 2)
let bl = CIFilter.gaussianBlur(); bl.inputImage = px.outputImage!.cropped(to: ci.extent); bl.radius = Float(max(2, W / 400))
let blurred = bl.outputImage!.cropped(to: ci.extent)
// mask = union of boxes (rounded, soft edge)
var mask = CIImage(color: .black).cropped(to: ci.extent)
for r in boxes {
  let g = CIFilter.roundedRectangleGenerator(); g.extent = r; g.radius = Float(min(r.width, r.height) * 0.2); g.color = .white
  mask = g.outputImage!.composited(over: mask).cropped(to: ci.extent)
}
let soft = CIFilter.gaussianBlur(); soft.inputImage = mask; soft.radius = 3
let blend = CIFilter.blendWithMask(); blend.inputImage = blurred; blend.backgroundImage = ci; blend.maskImage = soft.outputImage!.cropped(to: ci.extent)
let out = blend.outputImage!.cropped(to: ci.extent)
let ctx = CIContext()
guard let cg = ctx.createCGImage(out, from: out.extent) else { exit(3) }
let rep = NSBitmapImageRep(cgImage: cg)
guard let png = rep.representation(using: .png, properties: [:]) else { exit(4) }
try png.write(to: outURL)
print("ok")
