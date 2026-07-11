import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ activeTab }) {
    const navigate = useNavigate();
    const menuItems = [
        { id: "dashboard", label: "لوحة القيادة", icon: "fa-chart-pie", path: "/doctor/dashboard" },
        { id: "patients", label: "المرضى", icon: "fa-user-group", path: "/doctor/patients" },
        { id: "timetable", label: "الجدول الزمني", icon: "fa-calendar-days", path: "/doctor/timetable" },
        { id: "analysis", label: "التحليلات", icon: "fa-chart-line", path: "/doctor/analysis" },
    ];

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`menu-item ${activeTab === item.id ? "active" : ""}`}
                        onClick={() => navigate(item.path)}
                    >
                        <i className={`fa-solid ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default Sidebar;
