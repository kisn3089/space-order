import MotionTabs from "./components/motionTabs/MotionTabs";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        로그인
      </h1>
      <MotionTabs />
    </div>
  );
}
