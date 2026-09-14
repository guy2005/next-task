"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";

const DEFAULT_IMAGE =
  "https://zmkbbupkbfhwobwigfsq.supabase.co/storage/v1/object/public/task_bk/task_logo.png";

type Task = {
  id: string;
  title: string;
  detail: string;
  image_url: string;
  id_completed: boolean;
};

export default function EditTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params.id;
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from("task_tb")
        .select("id, title, detail, image_url, id_completed")
        .eq("id", taskId)
        .single();

      if (error) {
        console.error("Error fetching task:", error);
        await Swal.fire({
          icon: "error",
          title: "ไม่พบข้อมูล task",
          text: error.message,
          confirmButtonText: "กลับหน้าหลัก",
        });
        router.replace("/hometask");
        return;
      }

      const task = data as Task;
      setTitle(task.title);
      setDetail(task.detail);
      setIsCompleted(task.id_completed);
      setImagePreview(task.image_url || DEFAULT_IMAGE);
      setLoading(false);
    };

    if (taskId) {
      fetchTask();
    }
  }, [router, taskId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveTask = async () => {
    if (!title.trim() || !detail.trim()) {
      await Swal.fire({
        icon: "error",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "กรุณากรอกหัวข้องานและรายละเอียดงาน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setSaving(true);

    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `dtisau_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("task_bk")
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("task_bk")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("task_tb")
        .update({
          title: title.trim(),
          detail: detail.trim(),
          id_completed: isCompleted,
          image_url: imageUrl,
        })
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      await Swal.fire({
        icon: "success",
        title: "บันทึกการแก้ไขสำเร็จ",
        showConfirmButton: false,
        timer: 1200,
      });
      router.push("/hometask");
    } catch (error) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: message,
        confirmButtonText: "ตกลง",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      <div className="w-full max-w-md mx-auto text-center mt-10 px-4 mb-12">
        <AppName />
        <Image
          src={DEFAULT_IMAGE}
          alt="detail"
          width={100}
          height={100}
          className="mx-auto mt-6"
        />

        <div className="w-full mt-8 border border-gray-400 rounded-xl px-6 py-8 text-left bg-white shadow-sm">
          <h1 className="text-center text-2xl font-bold mb-6">แก้ไขข้อมูลงาน</h1>

          {loading ? (
            <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
          ) : (
            <>
              <h3 className="mt-4 mb-2 font-medium">ป้อนหัวข้องาน</h3>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="border rounded-md p-2 w-full bg-amber-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <h3 className="mt-4 mb-2 font-medium">ป้อนรายละเอียดงาน</h3>
              <textarea
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                className="border rounded-md p-2 w-full bg-amber-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />

              <h3 className="mt-4 mb-2 font-medium">เลือกรูป</h3>
              <div className="my-3">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="mx-auto rounded-md object-cover w-32 h-32 border"
                />
              </div>
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
                onChange={(event) => setIsCompleted(event.target.value === "1")}
                className="border rounded-md p-2 w-full bg-amber-50"
              >
                <option value="1">เสร็จ</option>
                <option value="0">ยังไม่เสร็จ</option>
              </select>

              <button
                onClick={saveTask}
                disabled={saving}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded transition"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </>
          )}
        </div>

        <div className="mt-6">
          <Link href="/hometask" className="inline-block text-blue-500 hover:underline font-medium">
            ← กลับไปหน้าหลัก
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
