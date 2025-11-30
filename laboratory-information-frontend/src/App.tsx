import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "sonner";
import AOS from "aos";
import "aos/dist/aos.css";
import './i18n';
function App() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });
  }, []);

  return (
    <>
      {/* Toaster sẽ hiển thị tất cả toast trong app */}
      <Toaster position="top-right" richColors />
      
      {/* Các route khác */}
      <AppRoutes />
    </>
  );
}

export default App;
