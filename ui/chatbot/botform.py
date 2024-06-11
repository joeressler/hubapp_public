from flask_wtf import FlaskForm
from flask import Flask
from wtforms import SelectField, StringField, HiddenField, SelectMultipleField, DateField, BooleanField
from flask_wtf.csrf import generate_csrf
from wtforms.fields.choices import RadioField
from wtforms.fields.simple import TextAreaField
from wtforms.validators import DataRequired


class BotForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.csrf_token.data = generate_csrf()

    augment = RadioField(label="Please select the retrieval augmentation you'd like to use:", name="augment", validators=[DataRequired()],
                         choices=[("wows", "World of Warships"),
                                  ("lol", "League of Legends"),
                                  ("warcraft", "World of Warcraft")])

    question = TextAreaField(name="question", validators=[DataRequired()], render_kw={"rows": 4, "cols": 75})
