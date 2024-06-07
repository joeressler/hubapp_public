from flask import Blueprint, jsonify, render_template, Response, request, session, flash, redirect, url_for


from ui import game
from ui.game.game_search_form import GameSearchForm
from modules.game_db import GameDB
from ui.auth.auth_controller import login_required
from modules.users import User

game_blueprint = Blueprint('game', __name__, template_folder='templates')


@game_blueprint.route('/game/list', methods=['GET'])
def index():
    rows = GameDB.listgames()
    return render_template("gamelist.html", rows=rows)



@game_blueprint.route('/game/rating', methods=['GET'])
@login_required
def game_rating():
    error = None
    game_id = request.args.get('game_id')
    game_info = GameDB.listgames(game_id)
    if game_info is None or len(game_info) == 0:
        error = "Bad Game ID"
    form = GameSearchForm()
    form.game_id.data = game_id
    if error:
        #TODO Fix flash() not appearing before redirect
        flash(error)
        redirect(url_for('game.index'))
    return render_template("rating.html", form=form, game_info=game_info[0])


"""
@game_blueprint.route('/game/<int:id>/rating', methods=['GET','POST'])
def game_rating(id):
    user = User.get_user(id)

    if request.method == "POST":
        error = None
        if error is not None:
            flash(error)
        else:
            # do some stuff to make them able to community vote on games
            # I think this part needs to be rewritten to just direct to rating_submit with an id
            return redirect(url_for('.index'))

"""


@game_blueprint.route('/game/rating_submit', methods=['POST'])
@login_required
def rating_submit():
    user_id = session.get("user_id")
    game_id = request.form.get("game_id")
    game_rating = request.form.get("game_rating")
    game_fullclear = request.form.get("game_fullclear")
    if game_fullclear is None:
        game_fullclear = 0
    elif game_fullclear == 'y':
        game_fullclear = 1
    empty_fields = False
    for x in [game_id, game_rating, game_fullclear]:
        if x == "":
            empty_fields = True
    if empty_fields:
        form = GameSearchForm()
        return render_template("rating.html", form=form, error="<b>Please enter game details</b>")
    else:
        rating_exists = GameDB.lookup_user_rating(game_id, user_id)
        switch = False
        if rating_exists:
            switch = True
        GameDB.add_game_rating(game_id, game_rating, game_fullclear, user_id, switch)
        #flash("{0} by {3} successfully submitted the game, cleared: {2!s}, rating: {1}".format(game_id, game_rating, game_fullclear))
    return redirect(url_for('game.index'))


@game_blueprint.route('/game/validatefield', methods=['POST'])
def field_validation():
    data = request.get_json(force=True)
    game_name = data["game_name"]
    game_exists = GameDB.lookupgame(game_name)
    # game does not exist already check
    answer = {"valid": game_exists is None}
    json_answer = jsonify(answer)
    print(game_exists)
    return json_answer

