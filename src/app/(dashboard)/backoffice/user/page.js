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
      <div className="flex-1 flex items-center justify-center font-mono">
        <div className="text-zinc-500 animate-pulse text-xs uppercase">กำลังโหลดฐานข้อมูลสิทธิ์ผู้ใช้...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-rose-500" /> รายชื่อเจ้าหน้าที่ระบบ
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">จัดการบัญชีผู้ใช้งานและระดับสิทธิ์การเข้าถึงระบบ</p>
      </div>

      {/* Users List Container */}
      <div className="bg-[#101114] border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-900/60 bg-zinc-950/20 flex justify-between items-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">ฐานข้อมูลผู้ใช้งาน</span>
          <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-950/50 px-2 py-0.5 rounded font-mono font-bold uppercase">
            {users.length} บัญชีผู้ใช้งาน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 uppercase font-mono font-bold text-[10px] bg-zinc-950/10">
                <th className="p-4 pl-6">ไอดี</th>
                <th className="p-4">ข้อมูลเจ้าหน้าที่</th>
                <th className="p-4">อีเมลระบบ</th>
                <th className="p-4">บทบาท / สิทธิ์การเข้าถึง</th>
                <th className="p-4">วันที่เข้าร่วม</th>
                <th className="p-4 pr-6 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {users.map((u) => {
                const userRole = roles.find((r) => r.id === u.roleId);
                const isAdmin = userRole?.name?.toLowerCase() === "admin";
                const isEditing = editingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="p-4 pl-6 font-mono text-zinc-500">#{u.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-rose-400 uppercase">
                          {u.name?.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-300">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">{u.email}</td>
                    <td className="p-4">
                      {isEditing ? (
                        <select
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                          className="bg-black border border-zinc-800 focus:border-rose-500 rounded p-1.5 font-bold text-white max-w-[150px]"
                        >
                          <option value="">เลือกบทบาท</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name === "admin" ? "Admin" : r.name === "user" ? "User" : r.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max ${
                          isAdmin 
                            ? "bg-red-500/10 text-red-500 border border-red-950/40" 
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}>
                          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          {userRole ? (userRole.name === "admin" ? "Admin" : userRole.name === "user" ? "User" : userRole.name) : "User"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-700" /> {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveRole(u.id)}
                            className="p-1.5 bg-emerald-500/10 border border-emerald-950/30 hover:border-emerald-500 text-emerald-500 rounded-md transition-colors"
                            title="บันทึก"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-md transition-colors"
                            title="ยกเลิก"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="p-1.5 bg-zinc-950 border border-zinc-900 hover:border-rose-500 text-zinc-400 hover:text-rose-500 rounded-md transition-colors inline-flex"
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
