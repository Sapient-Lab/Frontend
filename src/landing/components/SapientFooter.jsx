import { Link } from "react-router-dom";
import { Mail, Shield, FileText, FlaskConical } from "lucide-react";

const SapientFooter = () => {
  return (
    <footer className="border-t border-cyan-500/20 bg-gradient-to-b from-transparent to-cyan-950/30 dark:to-cyan-950/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span className="font-display text-sm font-bold tracking-widest gradient-text">
                SAPIENT LAB AI
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono max-w-md">
              Scientific notebook assistant focused on human-in-the-loop decisions, safety, and explainability.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3">PLATFORM</h4>
            <ul className="space-y-2">
              <li><a href="#capabilities" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Capabilities</a></li>
              <li><a href="#home" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Home</a></li>
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Sign in</Link></li>
            </ul>
          </div>

          {/* Product areas */}
          <div>
            <h4 className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3">PRODUCT</h4>
            <ul className="space-y-2">
              <li><Link to="/app/lab" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Intelligent Lab</Link></li>
              <li><Link to="/app/protocolos" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Protocol Scanner</Link></li>
              <li><Link to="/app/docs" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Resources & Documents</Link></li>
              <li><Link to="/onboarding" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Onboarding</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cyan-500/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-xs text-gray-500">
            © 2026 SAPIENT LAB AI · All rights reserved
          </div>
          
          <div className="flex items-center gap-6">
            {[
              { icon: Mail, label: "Contact" },
              { icon: Shield, label: "Privacy" },
              { icon: FileText, label: "Terms" },
            ].map(({ icon: Icon, label }) => (
              <Link key={label} to="/login" className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-xs font-mono">
                <Icon size={12} />
                {label}
              </Link>
            ))}
          </div>

          <Link
            to="/login"
            className="font-mono text-xs font-semibold tracking-wider px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white"
          >
            ENTER LAB
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default SapientFooter;