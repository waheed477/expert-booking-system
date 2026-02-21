export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm tracking-wide">
            © {new Date().getFullYear()} ExpertBooking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}