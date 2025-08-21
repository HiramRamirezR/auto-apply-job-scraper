
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';
import { Briefcase, Link, MapPin, Search, Bot, Play, Square, Timer } from 'lucide-react';

// --- Tipos de Datos ---
type JobStatus = 'pending' | 'applying' | 'applied' | 'failed';

interface Vacancy {
    id: number;
    title: string;
    company: string;
    location: string;
    url: string;
    status: JobStatus;
}

// --- Datos de Ejemplo (Simulando una respuesta del Backend) ---
const dummyVacancies: Vacancy[] = [
    { id: 1, title: 'Frontend Developer (React)', company: 'Tech Solutions Inc.', location: 'Remoto', url: '#', status: 'pending' },
    { id: 2, title: 'Backend Engineer (Node.js)', company: 'Data Systems', location: 'New York, NY', url: '#', status: 'pending' },
    { id: 3, title: 'Full-Stack Developer', company: 'Innovate LLC', location: 'San Francisco, CA', url: '#', status: 'pending' },
    { id: 4, title: 'UX/UI Designer', company: 'Creative Minds', location: 'Austin, TX', url: '#', status: 'pending' },
    { id: 5, title: 'DevOps Engineer', company: 'CloudWorks', location: 'Remoto', url: '#', status: 'pending' },
    { id: 6, title: 'Project Manager', company: 'Agile Ventures', location: 'Chicago, IL', url: '#', status: 'pending' },
    { id: 7, title: 'Data Scientist', company: 'Quantum Analytics', location: 'Boston, MA', url: '#', status: 'pending' },
    { id: 8, title: 'React Native Developer', company: 'MobileFirst', location: 'Remoto', url: '#', status: 'pending' },
    { id: 9, title: 'Software Engineer in Test', company: 'Quality Assured', location: 'Seattle, WA', url: '#', status: 'pending' },
    { id: 10, title: 'Cloud Architect (AWS)', company: 'InfraScale', location: 'Remoto', url: '#', status: 'pending' },
    { id: 11, title: 'Product Owner', company: 'User Centric', location: 'Denver, CO', url: '#', status: 'pending' },
];

const App: React.FC = () => {
    const [targetUrl, setTargetUrl] = useState('https://www.glassdoor.com/Job/');
    const [keywords, setKeywords] = useState('React developer');
    const [location, setLocation] = useState('Remoto');

    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isScraping, setIsScraping] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // --- Estado del Programador (Scheduler) ---
    const [jobsPerBatch, setJobsPerBatch] = useState(3);
    const [intervalHours, setIntervalHours] = useState(2);
    const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
    const [nextRunTime, setNextRunTime] = useState<number | null>(null);
    const [countdown, setCountdown] = useState('');

    const schedulerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const runBatchCallbackRef = useRef<() => void>();

    const handleStopScheduler = useCallback(() => {
        setIsSchedulerRunning(false);
        if (schedulerTimerRef.current) {
            clearInterval(schedulerTimerRef.current);
            schedulerTimerRef.current = null;
        }
        setNextRunTime(null);
        setIsApplying(false);
        setLogs(prev => [...prev, '--- Programador detenido ---']);
    }, []);

    const runApplicationBatch = useCallback(async () => {
        setIsApplying(true);
        setLogs(prev => [...prev, '--- Iniciando nuevo lote de aplicaciones ---']);

        let vacanciesToApply: Vacancy[] = [];
        let noMoreJobs = false;

        setVacancies(currentVacancies => {
            vacanciesToApply = currentVacancies.filter(v => v.status === 'pending').slice(0, jobsPerBatch);

            if (vacanciesToApply.length === 0) {
                noMoreJobs = true;
                return currentVacancies;
            }

            const applyingIds = new Set(vacanciesToApply.map(v => v.id));
            return currentVacancies.map(v =>
                applyingIds.has(v.id) ? { ...v, status: 'applying' as JobStatus } : v
            );
        });

        if (noMoreJobs) {
            setLogs(prev => [...prev, 'No hay más vacantes pendientes. Deteniendo el programador.']);
            handleStopScheduler();
            return;
        }

        for (const vacancy of vacanciesToApply) {
            setLogs(prev => [...prev, `[Lote] Aplicando a: "${vacancy.title}" en ${vacancy.company}`]);

            let success = false;
            try {
                const response = await fetch('http://localhost:5000/api/apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        job_link: vacancy.url,
                        resume_path: "C:\\Users\\HP\\Documents\\hiramDev\\auto apply job scraper\\resume.pdf", // IMPORTANT: Update this path to your actual resume.pdf
                        cover_letter_path: "", // Optional, provide path if you have one
                        full_name: "John Doe", // Placeholder
                        email: "john.doe@example.com", // Placeholder
                        phone_number: "123-456-7890", // Placeholder
                        linkedin_profile: "https://www.linkedin.com/in/johndoe", // Placeholder
                        github_profile: "https://github.com/johndoe", // Placeholder
                        portfolio_link: "https://www.johndoe.com", // Placeholder
                        years_of_experience: "5", // Placeholder
                        grad_month: "05", // Placeholder
                        grad_year: "2015", // Placeholder
                        college_name: "University of Placeholder", // Placeholder
                        degree: "Bachelor", // Placeholder
                        major: "Computer Science", // Placeholder
                        work_authorization: "US Citizen", // Placeholder
                        sponsorship_required: "No", // Placeholder
                        disability: "No", // Placeholder
                        veteran_status: "No" // Placeholder
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al aplicar a la vacante.');
                }

                const data = await response.json();
                success = data.message === "Application successful"; // Assuming backend returns this message on success

            } catch (err: any) {
                console.error('Error during application:', err);
                setLogs(prev => [...prev, `Error al aplicar a ${vacancy.title}: ${err.message || 'Desconocido'}`]);
                success = false;
            }

            const finalStatus: JobStatus = success ? 'applied' : 'failed';

            setVacancies(prev => prev.map(v => v.id === vacancy.id ? { ...v, status: finalStatus } : v));
            setLogs(prev => [...prev, `-> Estado: ${success ? 'APLICACIÓN EXITOSA' : 'FALLÓ LA APLICACIÓN'}`]);
        }

        setIsApplying(false);
        setLogs(prev => [...prev, `Lote finalizado. Esperando para la próxima ejecución.`]);
        setNextRunTime(Date.now() + intervalHours * 60 * 60 * 1000);

    }, [jobsPerBatch, intervalHours, handleStopScheduler]);

    useEffect(() => {
        runBatchCallbackRef.current = runApplicationBatch;
    }, [runApplicationBatch]);

    const handleStartScheduler = () => {
        if (vacancies.filter(v => v.status === 'pending').length === 0) {
            setError("No hay vacantes pendientes para aplicar.");
            return;
        }
        setIsSchedulerRunning(true);
        setError(null);
        setLogs(prev => [...prev, `Programador iniciado. Aplicando a ${jobsPerBatch} vacantes cada ${intervalHours} hora(s).`]);

        runBatchCallbackRef.current?.();

        const intervalInMs = intervalHours * 60 * 60 * 1000;
        schedulerTimerRef.current = setInterval(() => {
            runBatchCallbackRef.current?.();
        }, intervalInMs);
    };

    useEffect(() => {
        if (!isSchedulerRunning || !nextRunTime) {
            setCountdown('');
            return;
        }

        const countdownInterval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, nextRunTime - now);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [isSchedulerRunning, nextRunTime]);

    const handleScrape = async () => {
        setIsScraping(true);
        setError(null);
        setVacancies([]);
        setLogs(['Iniciando scraping...']);

        try {
            const response = await fetch('http://localhost:5000/api/get_links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_title: keywords,
                    location: location,
                    radius: 0, // Not used by current Python script, but for API consistency
                    job_platform: 'Glassdoor' // Not used by current Python script, but for API consistency
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al buscar vacantes.');
            }

            const data = await response.json();
            // Assuming the backend returns an object like { links: ["url1", "url2"] }
            const fetchedLinks: string[] = data.links || [];

            // Convert fetched links into Vacancy objects
            const newVacancies: Vacancy[] = fetchedLinks.map((url, index) => ({
                id: index + 1, // Simple ID generation
                title: 'Vacante Encontrada', // Placeholder, ideally parsed from link or backend
                company: 'Desconocida', // Placeholder
                location: location, // Use the searched location
                url: url,
                status: 'pending',
            }));

            setVacancies(newVacancies);
            setLogs(prev => [...prev, `Scraping completado. ${newVacancies.length} vacantes encontradas.`]);

        } catch (err: any) {
            console.error('Error during scraping:', err);
            setError(err.message || 'Error desconocido durante el scraping.');
            setLogs(prev => [...prev, `Error durante el scraping: ${err.message || 'Desconocido'}`]);
        } finally {
            setIsScraping(false);
        }
    };

    const getStatusPill = (status: JobStatus) => {
        const statusMap = {
            pending: { text: 'Pendiente', className: 'status-pending' },
            applying: { text: 'Aplicando...', className: 'status-applying' },
            applied: { text: 'Aplicado', className: 'status-applied' },
            failed: { text: 'Falló', className: 'status-failed' },
        };
        const { text, className } = statusMap[status];
        return <span className={`status-pill ${className}`}>{text}</span>;
    };

    return (
        <div className="container">
            <header>
                <h1>Job Scraper & Auto-Applier</h1>
                <p>Ingresa una URL y filtros para encontrar y aplicar a vacantes de forma automática.</p>
            </header>

            <div className="card input-section">
                <div className="input-group">
                    <Link size={20} />
                    <input type="text" placeholder="URL del portal de empleos" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
                </div>
                <div className="input-group">
                    <Search size={20} />
                    <input type="text" placeholder="Palabras clave (ej. 'React Developer')" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                </div>
                <div className="input-group">
                    <MapPin size={20} />
                    <input type="text" placeholder="Ubicación (ej. 'Remoto')" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <button onClick={handleScrape} disabled={isScraping || isSchedulerRunning}>
                    {isScraping ? 'Buscando...' : 'Buscar Vacantes'}
                </button>
            </div>

            <main>
                <div className="results-column">
                    <h2>Resultados de Búsqueda</h2>
                    {isScraping && <div className="loader"></div>}
                    {error && <p className="error-message">{error}</p>}
                    <div className="vacancies-list">
                        {vacancies.map(job => (
                            <div key={job.id} className="vacancy-card">
                                <div className="vacancy-header">
                                    <h3>{job.title}</h3>
                                    {getStatusPill(job.status)}
                                </div>
                                <p className="company-name"><Briefcase size={16} /> {job.company}</p>
                                <p className="location"><MapPin size={16} /> {job.location}</p>
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="details-link">Ver detalles</a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="actions-column">
                    <h2>Acciones y Registro</h2>
                    <div className="card scheduler-card">
                        <div className="scheduler-header">
                            <Bot size={24} />
                            <h3>Programador de Aplicaciones</h3>
                        </div>
                        <div className="scheduler-controls">
                            <div className="input-group vertical">
                                <label htmlFor="jobsPerBatch">Vacantes por Lote</label>
                                <input id="jobsPerBatch" type="number" value={jobsPerBatch} onChange={e => setJobsPerBatch(Number(e.target.value))} min="1" disabled={isSchedulerRunning} />
                            </div>
                            <div className="input-group vertical">
                                <label htmlFor="intervalHours">Intervalo (horas)</label>
                                <input id="intervalHours" type="number" value={intervalHours} onChange={e => setIntervalHours(Number(e.target.value))} min="1" disabled={isSchedulerRunning} />
                            </div>
                        </div>
                        <div className="scheduler-status">
                            <p>Estado: <strong>{isSchedulerRunning ? (isApplying ? 'Aplicando...' : 'Activo') : 'Detenido'}</strong></p>
                            {isSchedulerRunning && !isApplying && nextRunTime && (
                                <p className="countdown-label">Próxima ejecución en: <span className="countdown">{countdown}</span></p>
                            )}
                        </div>
                        <div className="scheduler-buttons">
                            <button onClick={handleStartScheduler} disabled={isSchedulerRunning || isScraping || vacancies.length === 0}><Play size={16} /> Iniciar</button>
                            <button onClick={handleStopScheduler} disabled={!isSchedulerRunning} className="stop-button"><Square size={16} /> Detener</button>
                        </div>
                    </div>
                    <div className="card logs-card">
                        <h3>Registro de Actividad</h3>
                        <div className="logs-container">
                            {logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
