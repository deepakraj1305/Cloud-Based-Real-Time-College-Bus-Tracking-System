import { Link } from 'react-router-dom';
import { Bus, MapPin, Shield, Users, ArrowRight, Cloud, Route as RouteIcon, Bell, LineChart } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-ink-950 dark:via-ink-900 dark:to-brand-950">
      {/* Top nav */}
      <nav className="px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center text-white shadow-lg">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-ink-900 dark:text-white tracking-tight">CampusTransit</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-500">Cloud Bus System</div>
          </div>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow"
        >
          Sign in <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-8 pt-10 pb-20 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium mb-5">
              <Cloud className="w-3.5 h-3.5" /> Cloud-Based · Real-Time · Multi-Role
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 dark:text-white leading-[1.05]">
              College bus tracking, <span className="text-brand-600">reimagined</span> for the cloud.
            </h1>
            <p className="mt-5 text-lg text-ink-600 dark:text-ink-300 max-w-lg">
              CampusTransit is a modern, cloud-native platform for managing your
              campus fleet. Track buses live, coordinate drivers, and keep every
              student informed — all from one dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-lg shadow-brand-600/20"
              >
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 text-ink-800 dark:text-ink-200 font-medium"
              >
                Explore features
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: '10', l: 'Buses' },
                { n: '30', l: 'Students' },
                { n: '5', l: 'Live Routes' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-bold text-ink-900 dark:text-white">{s.n}</div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card mock */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-brand-500/20 to-brand-900/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-200 dark:border-ink-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-ink-200 dark:border-ink-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="ml-2 text-xs text-ink-500 font-mono">campustransit.app / live</div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-ink-500 tracking-widest">Route 03 · Whitefield</div>
                    <div className="font-semibold text-ink-900 dark:text-white">Bus CT-1042</div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                    ● On route
                  </div>
                </div>

                <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-950">
                  <svg viewBox="0 0 400 160" className="absolute inset-0 w-full h-full">
                    <path d="M 30 130 Q 100 40 200 90 T 380 40" stroke="#1d4ed8" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.8" />
                    {[[30, 130], [130, 70], [240, 100], [380, 40]].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="6" fill="white" stroke="#1d4ed8" strokeWidth="3" />
                    ))}
                    <g transform="translate(215, 82)">
                      <circle r="14" fill="#2563eb" opacity="0.2" />
                      <circle r="9" fill="#2563eb" stroke="white" strokeWidth="2" />
                    </g>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'ETA', v: '4 min' },
                    { l: 'Speed', v: '32 km/h' },
                    { l: 'Onboard', v: '18 / 40' },
                  ].map((s) => (
                    <div key={s.l} className="bg-ink-50 dark:bg-ink-800 rounded-lg p-3">
                      <div className="text-[10px] uppercase text-ink-500 tracking-wider">{s.l}</div>
                      <div className="font-semibold text-ink-900 dark:text-white">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-8 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 font-semibold mb-3">
            One platform. Three roles.
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white tracking-tight">
            Built for admins, drivers, and students.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: 'Admin Console', desc: 'Manage buses, drivers, students, routes and trips. Broadcast notifications and monitor emergency alerts.' },
            { icon: RouteIcon, title: 'Driver Cockpit', desc: 'View your assigned bus and route, start and end trips, and raise emergency alerts with one tap.' },
            { icon: MapPin, title: 'Student View', desc: 'See your bus, pickup stop, live location and estimated arrival — no more waiting in the dark.' },
          ].map((f) => (
            <div key={f.title} className="bg-white dark:bg-ink-900 rounded-xl p-6 border border-ink-200 dark:border-ink-800 shadow-sm">
              <div className="w-11 h-11 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-ink-900 dark:text-white text-lg mb-1">{f.title}</div>
              <div className="text-sm text-ink-600 dark:text-ink-400">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: MapPin, t: 'Live GPS map' },
            { icon: Bell, t: 'Notifications' },
            { icon: Users, t: 'Role-based access' },
            { icon: LineChart, t: 'Reports & analytics' },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/60 dark:bg-ink-900/60 border border-ink-200 dark:border-ink-800">
              <x.icon className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-ink-800 dark:text-ink-200">{x.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 pb-24 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Ready for a smarter campus commute?
          </h2>
          <p className="text-brand-100 max-w-lg mx-auto">
            Sign in with the demo Admin, Driver, or Student account and explore the entire system.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-white text-brand-800 font-semibold shadow-lg"
          >
            Sign in now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="px-4 sm:px-8 py-6 text-center text-xs text-ink-500 border-t border-ink-200 dark:border-ink-800">
        © {new Date().getFullYear()} CampusTransit · A Cloud Computing student project.
      </footer>
    </div>
  );
}
