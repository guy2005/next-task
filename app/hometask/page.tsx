"use client";

import { useEffect, useState } from "react";
import AppName from "@/components/AppName";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";

type Task = {
  id: string;
  title: string;
  detail: string;
  image_url: string;
  update_at: string;
  id_completed: boolean;
  created_at: string;
};

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const deleteTask = async (task: Task) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบงานนี้หรือไม่?",
      text: task.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบงาน",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) {
      return;
    }

    const { error } = await supabase.from("task_tb").delete().eq("id", task.id);

    if (error) {
      console.error("Error deleting task:", error);
      await Swal.fire({
        icon: "error",
        title: "ลบข้อมูลไม่สำเร็จ",
        text: error.message,
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setTasks((currentTasks) => currentTasks.filter((currentTask) => currentTask.id !== task.id));
    await Swal.fire({
      icon: "success",
      title: "ลบข้อมูลสำเร็จ",
      showConfirmButton: false,
      timer: 1200,
    });
  };

  // ดึงข้อมูล task จาก Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      // เปลี่ยนชื่อตารางเป็น task_tb ให้ตรงกับฐานข้อมูล
      const { data, error } = await supabase.from("task_tb").select("*");

      if (error) {
        console.error("Error fetching tasks:", error);
      } else if (data) {
        setTasks(data);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  // Alert ต้อนรับ (แสดงครั้งเดียวต่อ Session)
  useEffect(() => {
    const isAlertShown = sessionStorage.getItem("hasShownSuccessAlert");

    if (!isAlertShown) {
      Swal.fire({
        title: "เข้าใช้งานสำเร็จเรียบร้อย! 🐱✨",
        width: 600,
        padding: "3em",
        color: "#716add",
        background: "#fff url(https://sweetalert2.github.io/images/trees.png)",
        backdrop: `
          rgba(0,0,123,0.4)
          url("https://sweetalert2.github.io/images/nyan-cat.gif")
          left top
          no-repeat
        `,
      });

      sessionStorage.setItem("hasShownSuccessAlert", "true");
    }
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-slate-50">
      <div className="w-full max-w-4xl mx-auto text-center mt-12 px-4 mb-12">
        <AppName />

        <Image
          src="https://zmkbbupkbfhwobwigfsq.supabase.co/storage/v1/object/public/task_bk/task_logo.png"
          alt="Description"
          width={130}
          height={130}
          className="mx-auto mt-6"
          priority
        />

        {/* ปุ่มเพิ่ม task */}
        <div className="flex justify-end mt-8 w-full">
          <Link
            href="/addtask"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm transition"
          >
            + เพิ่ม task
          </Link>
        </div>

        {/* ตารางแสดงข้อมูล */}
        <div className="overflow-x-auto mt-4 bg-white rounded-xl shadow-md border border-gray-200">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                <th className="px-6 py-4 font-semibold text-sm whitespace-nowrap">รูปงาน</th>
                <th className="px-6 py-4 font-semibold text-sm whitespace-nowrap">ชื่องาน</th>
                <th className="px-6 py-4 font-semibold text-sm whitespace-nowrap">รายละเอียดงาน</th>
                <th className="px-6 py-4 font-semibold text-sm whitespace-nowrap">สถานะงาน</th>
                <th className="px-6 py-4 font-semibold text-sm whitespace-nowrap">ลบ / แก้ไข</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-gray-500">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-gray-500">
                    ยังไม่มีข้อมูล Task ในขณะนี้
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition">
                    {/* แสดงรูปงาน */}
                    <td className="px-6 py-4 flex justify-center items-center">
                      {task.image_url ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={task.image_url}
                            alt={task.title || "task image"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">ไม่มีรูปภาพ</span>
                      )}
                    </td>

                    {/* ชื่องาน */}
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {task.title}
                    </td>

                    {/* รายละเอียดงาน */}
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {task.detail || "-"}
                    </td>

                    {/* สถานะงาน */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          task.id_completed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {task.id_completed ? "เสร็จสิ้น" : "รอดำเนินการ"}
                      </span>
                    </td>

                    {/* ลบ / แก้ไข */}
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Link
                        href={`/edittask/${task.id}`}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded transition inline-block"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => deleteTask(task)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}