from flask_wtf import FlaskForm, RecaptchaField
from wtforms import SelectField, StringField, HiddenField, SelectMultipleField, DateField, BooleanField
from flask_wtf.csrf import generate_csrf
# from modules.search_form import SearchForm
from datetime import date

from wtforms.fields.simple import PasswordField
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.csrf_token.data = generate_csrf()

    returnURL = HiddenField()
    username = StringField('Username:', name="username", render_kw={"style": "height: 2.5ch; width: 30ch"})
    password = PasswordField('Password:', name="password", render_kw={"style": "height: 2.5ch; width: 30ch"})
    recaptcha = RecaptchaField()