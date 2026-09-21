import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อัปโหลดสลิป/ใบเสร็จผ่าน server action (ไฟล์ละไม่เกิน ~4MB)
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
