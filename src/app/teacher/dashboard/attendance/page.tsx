"use client";

import { useState } from "react";
import { Stack, Tab, Tabs } from "@mui/material";
import { TeacherAttendanceWorkspace } from "@/components/teacher/TeacherAttendanceWorkspace";
import { TeacherMyAttendanceWorkspace } from "@/components/teacher/TeacherMyAttendanceWorkspace";

const TeacherAttendancePage = () => {
  const [tab, setTab] = useState<"class" | "mine">("class");

  return (
    <Stack spacing={3}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab value="class" label="Class Attendance" />
        <Tab value="mine" label="My Attendance" />
      </Tabs>
      {tab === "class" ? <TeacherAttendanceWorkspace /> : <TeacherMyAttendanceWorkspace />}
    </Stack>
  );
};

export default TeacherAttendancePage;
