import type { Metadata } from "next";
import { LectureForm } from "../../components/lecture-form";

export const metadata: Metadata = {
  title: "Lecture-to-Sprints with GPT-5.6",
  description:
    "Turn an upcoming lecture abstract into validated listening sprints.",
};

export default function LecturePage() {
  return (
    <main className="content-page">
      <LectureForm />
    </main>
  );
}
