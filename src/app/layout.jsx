"use client";

// import "./globals.css";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from "./provider";
import Navbar from "@/components/Nav";
import Footer from "@/components/Footer";

const metadata = {
  title: "Flathunt",
  description: "Discover & Share the best homes for rent",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body>
        <Providers>
          <Navbar />
          <ToastContainer />
          <main className="h-screen p-3 bg-slate-200 dark:bg-[#121212]">
          {children}
          {/* <Footer /> */}
          </main>
        </Providers>

        <script
          type="text/javascript"
          src="./node_modules/tw-elements/dist/js/tw-elements.umd.min.js"
        ></script>
      </body>
    </html>
  );
};

export default RootLayout;
export { metadata };
