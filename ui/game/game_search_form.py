from flask_wtf import FlaskForm
from wtforms import SelectField, StringField, HiddenField, SelectMultipleField, DateField, BooleanField
from flask_wtf.csrf import generate_csrf
# from modules.search_form import SearchForm
from datetime import date
from wtforms.validators import DataRequired


class GameSearchForm(FlaskForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.csrf_token.data = generate_csrf()

    game_id = HiddenField(name="game_id")
    game_rating = SelectField(label='Game Rating (10 is best)', name="game_rating", choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10')],
                              render_kw={'style': 'color: black'})
    game_fullclear = BooleanField(label='Fullcleared Game:', name="game_fullclear", render_kw={'style': 'height: 30px; width: 30px'})