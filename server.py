import os
import sys
from flask_cors import CORS
from flask import Flask, request, jsonify

# Añadir el directorio actual al PATH de Python para poder importar los scripts
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar las funciones principales de tus scripts
# Asegúrate de que estas funciones no ejecuten sys.exit() o tengan lógica de main() que impida su importación
try:
    from get_links import get_job_links
    from apply import auto_apply_to_job
except ImportError as e:
    print(f"Error al importar scripts: {e}")
    print("Asegúrate de que get_links.py y apply.py estén en el mismo directorio y que sus funciones principales sean importables.")
    # Puedes añadir un sys.exit(1) aquí si quieres que el servidor no inicie sin los scripts
    # o manejarlo de otra manera, por ahora solo imprimimos el error.

app = Flask(__name__)
CORS(app) # Habilitar CORS para todas las rutas

@app.route('/api/get_links', methods=['POST'])
def get_links_endpoint():
    data = request.json
    job_title = data.get('job_title')
    location = data.get('location')
    radius = data.get('radius')
    job_platform = data.get('job_platform')

    if not all([job_title, location, job_platform]):
        return jsonify({"error": "Faltan parámetros: job_title, location, job_platform son requeridos."}), 400

    try:
        # Llama a la función de get_links.py
        # Asegúrate de que get_job_links devuelva una lista de enlaces o un formato JSON serializable
        links = get_job_links(job_title, location, radius, job_platform)
        return jsonify({"links": links}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/apply', methods=['POST'])
def apply_endpoint():
    data = request.json
    job_link = data.get('job_link')
    resume_path = data.get('resume_path')
    cover_letter_path = data.get('cover_letter_path')
    full_name = data.get('full_name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    linkedin_profile = data.get('linkedin_profile')
    github_profile = data.get('github_profile')
    portfolio_link = data.get('portfolio_link')
    years_of_experience = data.get('years_of_experience')
    grad_month = data.get('grad_month')
    grad_year = data.get('grad_year')
    college_name = data.get('college_name')
    degree = data.get('degree')
    major = data.get('major')
    work_authorization = data.get('work_authorization')
    sponsorship_required = data.get('sponsorship_required')
    disability = data.get('disability')
    veteran_status = data.get('veteran_status')

    # Validar que los parámetros esenciales estén presentes
    if not all([job_link, resume_path, full_name, email, phone_number]):
        return jsonify({"error": "Faltan parámetros esenciales para la aplicación."}), 400

    try:
        # Llama a la función de apply.py
        # Asegúrate de que auto_apply_to_job maneje todos estos parámetros
        result = auto_apply_to_job(
            job_link, resume_path, cover_letter_path, full_name, email, phone_number,
            linkedin_profile, github_profile, portfolio_link, years_of_experience,
            grad_month, grad_year, college_name, degree, major, work_authorization,
            sponsorship_required, disability, veteran_status
        )
        return jsonify({"message": "Aplicación procesada", "result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) # El servidor se ejecutará en http://localhost:5000