from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
import os # to get the resume file
import time # to sleep
# import get_links # No longer needed here, as server.py will handle orchestration

# The JOB_APP dictionary should be replaced by parameters passed to auto_apply_to_job
# and managed by the frontend.

# Greenhouse has a different application form structure than Lever, and thus must be parsed differently
def greenhouse(driver, full_name, email, phone_number, linkedin_profile, github_profile, portfolio_link, years_of_experience, grad_month, grad_year, college_name, degree, major, work_authorization, sponsorship_required, disability, veteran_status, resume_path):
    # Basic info
    # Assuming full_name can be split into first and last
    first_name = full_name.split(' ')[0] if ' ' in full_name else full_name
    last_name = full_name.split(' ')[-1] if ' ' in full_name else ''

    try:
        driver.find_element(By.ID, 'first_name').send_keys(first_name)
        driver.find_element(By.ID, 'last_name').send_keys(last_name)
        driver.find_element(By.ID, 'email').send_keys(email)
        driver.find_element(By.ID, 'phone').send_keys(phone_number)
    except NoSuchElementException:
        pass # Handle cases where these fields might not exist

    # Location (simplified, as original had complex dropdown logic)
    try:
        loc = driver.find_element(By.ID, 'job_application_location')
        # This might need more sophisticated handling depending on the exact form
        # For now, just send keys if the field exists
        loc.send_keys("Your Location Here") # Placeholder, ideally passed as param
        # loc.send_keys(Keys.DOWN) # manipulate a dropdown menu
        # loc.send_keys(Keys.DOWN)
        # loc.send_keys(Keys.RETURN)
        time.sleep(2)
    except NoSuchElementException:
        pass

    # Upload Resume
    try:
        # Assuming a file input element for resume upload
        # This might need adjustment based on the actual HTML structure
        resume_input = driver.find_element(By.CSS_SELECTOR, "input[type='file'][name='resume']")
        resume_input.send_keys(os.path.abspath(resume_path))
    except NoSuchElementException:
        # Fallback for paste option if file upload is not direct
        try:
            driver.find_element(By.CSS_SELECTOR, "[data-source='paste']").click()
            resume_zone = driver.find_element(By.ID, 'resume_text')
            resume_zone.click()
            # Read resume content and paste
            with open(resume_path, 'r', encoding='utf-8') as f:
                resume_content = f.read()
                resume_zone.send_keys(resume_content)
        except NoSuchElementException:
            print("Could not find resume upload or paste option.")
            return False # Indicate failure

    # Add LinkedIn
    try:
        driver.find_element(By.XPATH, "//label[contains(.,'LinkedIn')]/following-sibling::input").send_keys(linkedin_profile)
    except NoSuchElementException:
        pass

    # Add graduation year, university, degree, major (simplified)
    # These often involve selecting from dropdowns, which can be complex.
    # For now, we'll assume direct input or skip if not found.
    try:
        driver.find_element(By.XPATH, f"//select/option[text()='{grad_year}']").click()
    except NoSuchElementException:
        pass
    try:
        driver.find_element(By.XPATH, f"//select/option[contains(.,'{college_name}')]").click()
    except NoSuchElementException:
        pass
    try:
        driver.find_element(By.XPATH, f"//select/option[contains(.,'{degree}')]").click()
    except NoSuchElementException:
        pass
    try:
        driver.find_element(By.XPATH, f"//select/option[contains(.,'{major}')]").click()
    except NoSuchElementException:
        pass

    # Add website/portfolio
    try:
        driver.find_element(By.XPATH, "//label[contains(.,'Website')]/following-sibling::input").send_keys(portfolio_link)
    except NoSuchElementException:
        pass

    # Add work authorization (simplified)
    try:
        driver.find_element(By.XPATH, f"//select/option[contains(.,'{work_authorization}')]").click()
    except NoSuchElementException:
        pass

    # Submit application
    try:
        driver.find_element(By.ID, "submit_app").click()
        return True
    except NoSuchElementException:
        print("Submit button not found for Greenhouse.")
        return False

# Handle a Lever form
def lever(driver, full_name, email, phone_number, linkedin_profile, github_profile, portfolio_link, years_of_experience, grad_month, grad_year, college_name, degree, major, work_authorization, sponsorship_required, disability, veteran_status, resume_path):
    # Navigate to the application page (already done by auto_apply_to_job)
    # driver.find_element(By.CLASS_NAME, 'template-btn-submit').click() # This might be for a "Start Application" button

    # Basic info
    try:
        driver.find_element(By.NAME, 'name').send_keys(full_name)
        driver.find_element(By.NAME, 'email').send_keys(email)
        driver.find_element(By.NAME, 'phone').send_keys(phone_number)
        # Assuming 'org' is not a required field or can be derived
        # driver.find_element(By.NAME, 'org').send_keys(JOB_APP['org'])
    except NoSuchElementException:
        pass

    # Socials
    try:
        driver.find_element(By.NAME, 'urls[LinkedIn]').send_keys(linkedin_profile)
    except NoSuchElementException:
        pass
    try:
        driver.find_element(By.NAME, 'urls[Github]').send_keys(github_profile)
    except NoSuchElementException:
        try: # Try alternative name
            driver.find_element(By.NAME, 'urls[GitHub]').send_keys(github_profile)
        except NoSuchElementException:
            pass
    try:
        driver.find_element(By.NAME, 'urls[Portfolio]').send_keys(portfolio_link)
    except NoSuchElementException:
        pass

    # Add university (simplified)
    try:
        driver.find_element(By.CLASS_NAME, 'application-university').click()
        search = driver.find_element(By.XPATH, "//*[@type='search']")
        search.send_keys(college_name)
        search.send_keys(Keys.RETURN)
    except NoSuchElementException:
        pass

    # Add how you found out about the company (simplified)
    try:
        driver.find_element(By.CLASS_NAME, 'application-dropdown').click()
        driver.find_element(By.XPATH, "//select/option[text()='Glassdoor']").click() # Assuming Glassdoor is an option
    except NoSuchElementException:
        pass

    # Submit resume last so it doesn't auto-fill the rest of the form
    try:
        driver.find_element(By.NAME, 'resume').send_keys(os.path.abspath(resume_path))
    except NoSuchElementException:
        print("Could not find resume upload field for Lever.")
        return False # Indicate failure

    # Submit application
    try:
        driver.find_element(By.CLASS_NAME, 'template-btn-submit').click()
        return True
    except NoSuchElementException:
        print("Submit button not found for Lever.")
        return False

def auto_apply_to_job(job_link, resume_path, cover_letter_path, full_name, email, phone_number, linkedin_profile, github_profile, portfolio_link, years_of_experience, grad_month, grad_year, college_name, degree, major, work_authorization, sponsorship_required, disability, veteran_status, driver_path='/usr/local/bin/chromedriver'):
    driver = None # Initialize driver to None
    try:
        driver = webdriver.Chrome(executable_path=driver_path)
        driver.get(job_link)
        time.sleep(5) # wait for page to load

        if 'greenhouse' in job_link:
            result = greenhouse(driver, full_name, email, phone_number, linkedin_profile, github_profile, portfolio_link, years_of_experience, grad_month, grad_year, college_name, degree, major, work_authorization, sponsorship_required, disability, veteran_status, resume_path)
        elif 'lever' in job_link:
            result = lever(driver, full_name, email, phone_number, linkedin_profile, github_profile, portfolio_link, years_of_experience, grad_month, grad_year, college_name, degree, major, work_authorization, sponsorship_required, disability, veteran_status, resume_path)
        else:
            print(f"Job link not recognized as Greenhouse or Lever: {job_link}")
            result = False # Indicate failure for unrecognized links

        return "Application successful" if result else "Application failed"

    except Exception as e:
        print(f"An error occurred during application for {job_link}: {e}")
        return f"Application failed: {e}"
    finally:
        if driver:
            driver.quit() # Ensure driver is closed even if errors occur

# The __main__ block is for direct script execution and can remain as is,
# but it should call the refactored auto_apply_to_job with appropriate parameters.
# For now, I'll comment out the original __main__ block to avoid conflicts
# and provide a simple example.
if __name__ == '__main__':
    print("Running auto_apply_to_job directly for testing...")
    # Example usage (replace with your actual data for testing)
    test_job_link = "https://jobs.lever.co/example/job-id" # Replace with a real Lever or Greenhouse link
    test_resume_path = "C:\\Users\\HP\\Documents\\hiramDev\\auto apply job scraper\\resume.pdf" # Ensure this path is correct

    # Dummy data for testing
    result = auto_apply_to_job(
        job_link=test_job_link,
        resume_path=test_resume_path,
        cover_letter_path="", # Optional
        full_name="Test User",
        email="test@example.com",
        phone_number="123-456-7890",
        linkedin_profile="https://linkedin.com/in/testuser",
        github_profile="https://github.com/testuser",
        portfolio_link="https://testuser.com",
        years_of_experience="2",
        grad_month="05",
        grad_year="2020",
        college_name="University of Test",
        degree="Bachelor",
        major="Computer Science",
        work_authorization="US Citizen",
        sponsorship_required="No",
        disability="No",
        veteran_status="No"
    )
    print(f"Test application result: {result}")