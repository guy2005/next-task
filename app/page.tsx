"use client";

import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Page() {
  const [searchCode, setSearchCode] = useState("");
  const router = useRouter();

  const handleassestask = () => {
    if (searchCode === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'กรุณากรอกรหัสงานก่อน!',
      });
      return;
    }

    if (searchCode.toLowerCase() === 'dtisau') {
      // บันทึกสถานะว่าใส่รหัสถูกต้อง เพื่อให้เด้ง Alert รูปแมวเฉพาะครั้งนี้
      sessionStorage.setItem("showWelcomeAlert", "true");
      router.push('/hometask');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'รหัสไม่ถูกต้อง!',
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      <div className="w-full max-w-md mx-auto text-center mt-20 px-4">
        <AppName />

        <Image 
          src="https://zmkbbupkbfhwobwigfsq.supabase.co/storage/v1/object/public/task_bk/task_logo.png"
          alt="Description" 
          width={150} 
          height={150} 
          className="mx-auto mt-10" 
        />

        <input 
          type="text" 
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Enter task..." 
          className="w-full mt-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />

        <button 
          className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-700 transition" 
          onClick={handleassestask}
        >
          เข้าใช้งาน
        </button>
      </div>

      <Footer />
    </div>
  );
}