import Foundation
import Vision
import CoreImage
import AppKit

// ตัดฉากหลังด้วย Vision (foreground instance mask) → PNG โปร่งใส ครอปพอดีตัวรถ
let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let ci = CIImage(contentsOf: inURL) else { fputs("cannot read\n", stderr); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: ci, options: [:])
try handler.perform([req])
guard let obs = req.results?.first else { fputs("no foreground found\n", stderr); exit(2) }
let maskBuf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: true)
let out = CIImage(cvPixelBuffer: maskBuf)
let ctx = CIContext()
guard let cg = ctx.createCGImage(out, from: out.extent) else { exit(3) }
let rep = NSBitmapImageRep(cgImage: cg)
guard let png = rep.representation(using: .png, properties: [:]) else { exit(4) }
try png.write(to: outURL)
print("ok \(cg.width)x\(cg.height)")
