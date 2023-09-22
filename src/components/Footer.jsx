import { useEffect, useState } from "react";

const Footer = () => {

  const [currentYear, setCurrentYear] = useState(0);

  useEffect(()=>{
    const getCurrentYear = () => {
      const date = new Date();
      const year = date.getFullYear();
      setCurrentYear(year);
    }
    getCurrentYear();
  },[])
  

  return (
    <footer className=' w-full p-3 flex flex-col items-center justify-center flex-wrap bg-transparent'>
        <h6 className='text-center text-sm'>© {currentYear} Flathunt</h6>
        <p className="text-center text-sm">Find your perfect home, fast and easy, where comfort meets affordability</p>
    </footer>
  )
}

export default Footer