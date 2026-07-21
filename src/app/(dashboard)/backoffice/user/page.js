"use client";

import React, { useState, useEffect } from "react";
import { authServices } from "../../../../services/auth.service";
import { Users, Shield, Calendar, Edit2, Check, X, ShieldCheck } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all users
      const usersRes = await authServices.getAllUsers();
      setUsers(usersRes?.data || usersRes || []);

      // Get all roles
      const rolesRes = await authServices.getRoles();
      setRoles(rolesRes?.data || rolesRes || []);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถดึงข้อมูลการจัดการผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setSelectedRoleId(user.roleId ? String(user.roleId) : "");
  };

  const handleSaveRole = async (userId) => {
    if (!selectedRoleId) return alert("กรุณาเลือกบทบาทผู้ใช้");
    try {
      await authServices.updateUserRole(userId, selectedRoleId);
      alert("อัปเดตระดับสิทธิ์การเข้าใช้งานสำเร็จ");
      setEditingUserId(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถอัปเดตบทบาทผู้ใช้งานได้: " + (e.response?.data?.error || e.message));
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center ">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดฐานข้อมูลสิทธิ์ผู้ใช้...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 font-sans">
      {/* Users List Container */}
      <div className="bg-white border border-[#e9ecef] rounded-[28px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e9ecef] flex justify-between items-center">
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest ">ฐานข้อมูลผู้ใช้งาน</span>
          <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200/50 px-2.5 py-1 rounded-lg  font-bold uppercase">
            {users.length} บัญชีผู้ใช้งาน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e9ecef] text-zinc-400 uppercase  font-bold text-[10px]">
                <th className="p-4 pl-6">ไอดี</th>
                <th className="p-4">ข้อมูลเจ้าหน้าที่</th>
                <th className="p-4">อีเมลระบบ</th>
                <th className="p-4">บทบาท / สิทธิ์การเข้าถึง</th>
                <th className="p-4">วันที่เข้าร่วม</th>
                <th className="p-4 pr-6 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9ecef]">
              {users.map((u) => {
                const userRole = roles.find((r) => r.id === u.roleId);
                const isAdmin = userRole?.name?.toLowerCase() === "admin";
                const isEditing = editingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 pl-6  text-zinc-400">#{u.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f8f9fa] border border-[#e9ecef] flex items-center justify-center font-bold text-rose-500 uppercase">
                          {u.name?.substring(0, 2)}
                        </div>
                        <span className="font-bold text-zinc-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4  text-zinc-550 text-zinc-500">{u.email}</td>
                    <td className="p-4">
                      {isEditing ? (
                        <select
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                          className="bg-white border border-[#e9ecef] focus:border-rose-500 rounded-lg p-1.5 font-bold text-zinc-850 outline-none max-w-[150px]"
                        >
                          <option value="">เลือกบทบาท</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name === "admin" ? "Admin" : r.name === "user" ? "User" : r.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max ${isAdmin
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-zinc-100 text-zinc-650 border border-zinc-200"
                          }`}>
                          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          {userRole ? (userRole.name === "admin" ? "Admin" : userRole.name === "user" ? "User" : userRole.name) : "User"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-450 text-zinc-500 ">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-zinc-450 text-zinc-400" /> {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveRole(u.id)}
                            className="p-1.5 bg-emerald-50 border border-emerald-200 hover:border-emerald-500 text-emerald-500 rounded-md transition-colors cursor-pointer"
                            title="บันทึก"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-500 rounded-md transition-colors cursor-pointer"
                            title="ยกเลิก"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="p-1.5 bg-[#f8f9fa] border border-[#e9ecef] hover:border-rose-500 text-zinc-500 hover:text-rose-500 rounded-md transition-colors inline-flex cursor-pointer"
                          title="เปลี่ยนบทบาทผู้ใช้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
