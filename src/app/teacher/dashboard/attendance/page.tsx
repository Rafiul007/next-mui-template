"use client";

import { useState } from "react";
import { Stack, Tab, Tabs } from "@mui/material";
import { TeacherAttendanceWorkspace } from "@/components/teacher/TeacherAttendanceWorkspace";
import { TeacherMyAttendanceWorkspace } from "@/components/teacher/TeacherMyAttendanceWorkspace";
import { TeacherMyOvertimeClaimsWorkspace } from "@/components/teacher/TeacherMyOvertimeClaimsWorkspace";

const TeacherAttendancePage = () => {
  const [tab, setTab] = useState<"class" | "mine" | "overtime">("class");

  return (
    <Stack spacing={3}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab value="class" label="Class Attendance" />
        <Tab value="mine" label="My Attendance" />
        <Tab value="overtime" label="Overtime Claims" />
      </Tabs>
      {tab === "class" && <TeacherAttendanceWorkspace />}
      {tab === "mine" && <TeacherMyAttendanceWorkspace />}
      {tab === "overtime" && <TeacherMyOvertimeClaimsWorkspace />}
    </Stack>
  );
};

export default TeacherAttendancePage;
