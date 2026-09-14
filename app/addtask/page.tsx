"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppName from "@/components/AppName";
import Image from "next/image";
import Footer from "@/components/Footer";
import Link from "next/link";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
    const DEFAULT_IMAGE = "https://zmkbbupkbfhwobwigfsq.supabase.co/storage/v1/object/public/task_bk/task_logo.png";
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_IMAGE);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setImageFile(file);
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
        }
    };

    const handleReset = () => {
        setTitle("");
        setDetail("");
        setIsCompleted(false);
        setImagePreview(DEFAULT_IMAGE);
        setImageFile(null);
    };

    const saveTask = async () => {
        if (!title.trim() || !detail.trim() || !imageFile) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: 'กรุณากรอกหัวข้องาน รายละเอียดงาน และเลือกไฟล์รูปภาพ',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // 1. อัปโหลดรูปภาพไปยัง Supabase Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `dtisau_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('task_bk')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            // 2. ดึง Public URL ของรูปภาพ
            const { data: publicUrlData } = supabase.storage
                .from('task_bk')
                .getPublicUrl(fileName);

            const imageUrl = publicUrlData.publicUrl;

            // 3. บันทึกข้อมูลงานลงใน Supabase
            const { error: dbError } = await supabase
                .from('task_tb')
                .insert([
                    {
                        title: title,
                        detail: detail,
                        id_completed: isCompleted, // แก้ไขตรงนี้จาก idCompleted เป็น isCompleted
                        image_url: imageUrl,
                    }
                ]);

            if (dbError) throw dbError;

            await Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500
            });

            router.push("/hometask");
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
                confirmButtonText: 'ตกลง'
            });
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col justify-between">
            <div className="w-full max-w-md mx-auto text-center mt-10 px-4 mb-12">
                <AppName />

                <Image
                    src="https://zmkbbupkbfhwobwigfsq.supabase.co/storage/v1/object/public/task_bk/task_logo.png"
                    alt="detail"
                    width={100}
                    height={100}
                    className="mx-auto mt-6"
                />

                <div className="w-full mt-8 border border-gray-400 rounded-xl px-6 py-8 text-left bg-white shadow-sm">
                    <h1 className="text-center text-2xl font-bold mb-6">
                        เพิ่มข้อมูลงาน
                    </h1>

                    <h3 className="mt-4 mb-2 font-medium">ป้อนหัวข้องาน</h3>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border rounded-md p-2 w-full bg-amber-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <h3 className="mt-4 mb-2 font-medium">ป้อนรายละเอียดงาน</h3>
                    <textarea
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                        className="border rounded-md p-2 w-full bg-amber-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                    />

                    <h3 className="mt-4 mb-2 font-medium">เลือกรูป</h3>

                    <label
                        htmlFor="selectImageFile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        เลือกไฟล์รูป
                    </label>

                    {imagePreview && (
                        <div className="my-3">
                            <img
                                src={imagePreview}
                                alt="preview"
                                className="mx-auto rounded-md object-cover w-32 h-32 border"
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        id="selectImageFile"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border rounded-md p-2 w-full bg-amber-50 mt-1"
                    />

                    <h3 className="mt-4 mb-2 font-medium">สถานะงาน</h3>

                    <select
                        value={isCompleted ? "1" : "0"}
                        onChange={(e) =>
                            setIsCompleted(e.target.value === "1")
                        }
                        className="border rounded-md p-2 w-full bg-amber-50"
                    >
                        <option value="1">เสร็จ</option>
                        <option value="0">ยังไม่เสร็จ</option>
                    </select>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={saveTask}
                            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            บันทึกเพิ่มงาน
                        </button>

                        <button
                            onClick={handleReset}
                            className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            รีเซ็ตข้อมูล
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href="/hometask"
                        className="inline-block text-blue-500 hover:underline font-medium"
                    >
                        ← กลับไปหน้าหลัก
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}