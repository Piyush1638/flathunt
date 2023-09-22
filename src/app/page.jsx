import Link from "next/link";

const Home = () => {
  return (
    <section className="h-full w-full">
      <div className="dark:flex hidden w-96 h-96 rounded-full bg-purple-300 fixed -right-28 -bottom-20 blur-3xl z-1- md:blur-3xl ">
        <div className="w-64 h-64 sm:-mt-12  rounded-full bg-red-500 blur-2xl md:blur-3xl"></div>
      </div>
      <div className=" h-full w-full flex items-center">
        <div className="p-10">
          <h1 className="sm:w-3/5 w-full text-3xl font-bold">
            Experience The convenience & Excitement Of Finding Your Perfect Home
          </h1>
          <div className="flex items-center gap-4 mt-10">
            <Link href="/category/Rent" className="outline_btn"> Rent</Link>
            <Link href="/category/Flatmates" className="black_btn">Flatmates</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
