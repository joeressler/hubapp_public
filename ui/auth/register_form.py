from flask_wtf import FlaskForm, Recaptcha, RecaptchaField
from wtforms import SelectField, StringField, HiddenField, SelectMultipleField, DateField, BooleanField
from flask_wtf.csrf import generate_csrf
# from modules.search_form import SearchForm
from datetime import date

from wtforms.fields.simple import PasswordField
from wtforms.validators import DataRequired


class RegisterForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.csrf_token.data = generate_csrf()

    username = StringField('Username:', name="username")
    password = PasswordField('Password:\nMust be between 6 and 20 characters long, and contain at least 1 capital letter and 1 special character (!@#$%^&)', name="password")
    recaptcha = RecaptchaField()