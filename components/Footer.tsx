import React from 'react'
import Image from 'next/image'
import dev from '../assets/images/dev.png'; // นำเข้าไฟล์ภาพจาก public
export default function Footer() {
  return (
    <div>
      <hr />
      <p className="text-center mt-2 text-gray-500">
        &copy; 2026 Manage Task App.
      

        <br />

        {/* อ้างอิงไฟล์จาก public/dev.png ได้โดยตรง */}
        <Image src={dev} alt="Logo" width={50} height={50} className="mx-auto mt-3" />
      
      </p>
    </div>
  )
}