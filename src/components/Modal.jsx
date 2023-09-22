"use client";

import { useState } from "react";

// These imports are for authentication purpose
import { signInWithPopup, getAuth, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { FcGoogle } from "react-icons/fc";
import { IoCloseSharp } from "react-icons/io5";

// This import is for routing purpose
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


const Modal = () => {
  const [showModal, setShowModal] = useState(false);

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  // These lines are for Google Auth purpose
  const router = useRouter();

  const onGoogleAuthHandler = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          userId: user.uid,
          joinedAt: serverTimestamp(),
        });
      }
      toast.success("You have joined the community");
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleModalOpen}
        className="outline_btn"
      >
        Join 
      </button>
      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded bg-slate-300 dark:bg-gray-800 w-4/5 sm:w-3/5 md:w-2/5 lg:w-1/3 shadow-lg p-8">
            <div className="flex items-center justify-between ">
              <h2 className="text-xl">
                {/* Heading of Modal */}
                Join Now
              </h2>

              <button onClick={handleModalClose}>
                <IoCloseSharp className="font-bold text-3xl dark:text-white text-black" />
              </button>
            </div>
            <div>
              <button
                className="flex items-center w-full  text-white bg-slate-200 py-2 rounded mt-4"
                type="button"
                onClick={onGoogleAuthHandler}
              >
                <FcGoogle
                  style={{ width: "30px", height: "30" }}
                  className="mx-2"
                />{" "}
                <span className="text-black">
                  Continue with Google
                </span>
              </button>
            </div>
            <p className="mt-4">
              To create your account, Google will share your name, email
              address, and profile picture with Flathunt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;

