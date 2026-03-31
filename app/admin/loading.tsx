import LoadingCard from "@/app/components/LoadingCard";
import Navbar from "@/app/components/Navbar";

export default function AdminLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/60 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
          <LoadingCard label="Loading admin tools..." />
          <LoadingCard label="Fetching user management data..." />
        </div>
      </main>
    </>
  );
}
