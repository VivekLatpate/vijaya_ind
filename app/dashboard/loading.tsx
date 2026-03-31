import LoadingCard from "@/app/components/LoadingCard";
import Navbar from "@/app/components/Navbar";

export default function DashboardLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/60 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:px-8">
          <LoadingCard label="Loading your dashboard..." />
          <div className="grid gap-6 md:grid-cols-3">
            <LoadingCard label="Preparing account widgets..." />
            <LoadingCard label="Checking your role..." />
            <LoadingCard label="Finalizing secure access..." />
          </div>
        </div>
      </main>
    </>
  );
}
