"use client";
import "../app/globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Firebase imports
import { getAuth } from "firebase/auth";

// Components
import ThemeButton from "./ThemeButton";
import Modal from "./Modal";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const auth = getAuth();
  const router = useRouter();

  //  This will check if the user is logged in or not
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // console.log(user);
        setIsUserLoggedIn(true);
        // console.log(auth.currentUser.photoURL)
      } else {
        setIsUserLoggedIn(false);
      }
    });
  }, []);

  // Logout Handler
  const logoutHandler = () => {
    auth.signOut();
    toast.success("Logout Successful.")
    router.push("/");
  };

  return (
    <nav className="flex flex-between justify-between  w-full px-3 py-1">
      <Link href="/" className="flex items-center">
        <Image
          src="assets/images/logo.svg"
          width={30}
          height={30}
          alt="Promptverse Logo"
          priority={true}
          className="me-3"
        />
        <p className="font-satoshi font-semibold text-lg text-black tracking-wide dark:text-white">
          Flathunt
        </p>
      </Link>

      {/* Desktop Navigation */}
      <div className="sm:flex hidden  p-1">
        {isUserLoggedIn ? (
          <div className="flex gap-3 md:gap-5 items-center justify-evenly">
            <Link href="/" className="">
              Home
            </Link>

            <Link href="/my-wishlist" className="">
              Wishlist
            </Link>

            <Link href="/profile">
              <Image
                src={auth?.currentUser && `${auth.currentUser.photoURL}`}
                width={37}
                height={37}
                alt="Profile"
                className="rounded-full"
              />
            </Link>
            <ThemeButton />
          </div>
        ) : (
          <>
            <div className="flex items-center p-3 gap-4">
              {/* This is the button which makes the user account or helps in login modal */}
              <Modal type="Join Now" />
            </div>

            {/* This is the theme button component */}
            <ThemeButton />
          </>
        )}
      </div>

      {/* Mobile Navbar */}
      <div className="sm:hidden flex items-center p-5 relative">
        {isUserLoggedIn ? (
          <div className="flex">
            <Image
              src={auth?.currentUser && `${auth.currentUser.photoURL}`}
              width={37}
              height={37}
              alt="Profile"
              className="rounded-full"
              onClick={() => setToggleDropdown((prev) => !prev)}
            />

            {toggleDropdown && (
              <div className="dropdown  dark:bg-black">
                <Link
                  href="/"
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  Home
                </Link>

                <Link
                  href="/profile"
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  My Profile
                </Link>


                <Link
                  href="/my-wishlist"
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  Wishlist
                </Link>

                {/* <Link
                  href="/about-us"
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  About Us
                </Link> */}

                <ThemeButton />

                {/* <button
                  type="button"
                  onClick={() => {
                    setToggleDropdown(false);
                    logoutHandler();
                  }}
                  className="mt-3 w-full black_btn"
                >
                  Sign Out
                </button> */}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center  gap-3 ">
              {/* This is the button that will make a account of user of helps in login  modal */}
              <Modal type="Join Now" />
            </div>
            <ThemeButton />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
