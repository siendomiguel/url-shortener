import Link from 'next/link';
import { Button } from './ui/button';
import { BarChart3, Link2, Zap, Shield, Globe, MousePointer2 } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="py-20 px-5 flex flex-col items-center text-center space-y-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-b-[3rem]">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold tracking-wide uppercase mb-4 animate-fade-in">
                    <Zap size={14} />
                    El acortador más rápido y potente
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl px-2">
                    Controla cada click con <span className="text-blue-600">enlaces inteligentes</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed px-4">
                    Mucho más que un acortador. Obtén estadísticas en tiempo real, análisis de ubicación y optimiza tu presencia digital en segundos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto px-6 sm:px-0">
                    <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                        <Link href="/auth/sign-up">Empezar gratis</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-2xl px-8 h-14 text-lg font-bold border-2 w-full sm:w-auto bg-white dark:bg-transparent">
                        <Link href="/auth/login">Iniciar sesión</Link>
                    </Button>
                </div>

                {/* Fake Dashboard Preview */}
                <div className="mt-16 w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
                    <div className="h-10 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-40 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center space-y-2">
                            <BarChart3 className="text-blue-500" size={32} />
                            <span className="text-xs font-bold text-gray-400 uppercase">Analítica Real</span>
                        </div>
                        <div className="md:col-span-2 h-40 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center space-y-2">
                            <div className="w-4/5 h-2 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-500" />
                            </div>
                            <div className="w-4/5 h-2 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
                                <div className="w-1/2 h-full bg-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Tráfico por Dispositivo</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-5 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">Todo lo que necesitas</h2>
                    <p className="text-gray-500 dark:text-gray-400">Herramientas profesionales para creadores de contenido y empresas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Link2 className="text-blue-500" />,
                            title: "Acortamiento instantáneo",
                            desc: "Crea enlaces memorables en menos de un segundo con nuestra infraestructura optimizada."
                        },
                        {
                            icon: <BarChart3 className="text-green-500" />,
                            title: "Estadísticas avanzadas",
                            desc: "Conoce a tu audiencia con datos detallados de ubicación, dispositivos y referrers."
                        },
                        {
                            icon: <Shield className="text-purple-500" />,
                            title: "Seguro y Privado",
                            desc: "Enlaces protegidos y gestión de datos que cumplen con los más altos estándares."
                        },
                        {
                            icon: <Globe className="text-orange-500" />,
                            title: "Geolocalización",
                            desc: "Identifica desde qué países y ciudades vienen tus visitantes con mapas interactivos."
                        },
                        {
                            icon: <MousePointer2 className="text-red-500" />,
                            title: "Seguimiento de Referrers",
                            desc: "Descubre exactamente desde qué páginas web o redes sociales llegan a tus enlaces."
                        },
                        {
                            icon: <Zap className="text-yellow-500" />,
                            title: "Rápido como el rayo",
                            desc: "Diseñado para escalar y ofrecer redirecciones ultra rápidas sin interrupciones."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-5">
                <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center space-y-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                    <h2 className="text-4xl md:text-6xl font-black tracking-tight relative z-10">¿Listo para empezar?</h2>
                    <p className="text-xl text-blue-100 max-w-xl mx-auto relative z-10 font-medium">
                        Únete a miles de usuarios que ya optimizan sus enlaces con nuestra herramienta.
                    </p>
                    <div className="pt-6 relative z-10">
                        <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 rounded-2xl px-12 h-14 text-lg font-black shadow-xl transition-all hover:scale-105 active:scale-95">
                            <Link href="/auth/sign-up">Crear mi cuenta ahora</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
