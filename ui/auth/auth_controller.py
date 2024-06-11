import functools
import os

import requests
from flask import Blueprint, render_template, request, session, redirect, url_for, flash, g, abort

from modules.users import User
from ui.auth.login_form import LoginForm
from ui.auth.register_form import RegisterForm

auth_blueprint = Blueprint('auth', __name__, url_prefix='/auth', template_folder='templates')



@auth_blueprint.route('/register', methods=['GET', 'POST'])
def register():  # put application's code here
    form = RegisterForm()
    if request.method == 'POST':
        response = request.form['g-recaptcha-response']
        try:
            verify_response = requests.post(url=f'{os.environ.get('VERIFY_URL')}?secret={os.environ.get('RECAPTCHA_PRIVATE_KEY')}&response={response}').json()
            if verify_response['success'] == False or verify_response['score'] < 0.5:
                abort(401)
        except Exception as e:
            print(f"failed to get reCaptcha: {e}")
        returnURL = request.form.get("returnURL")
        if not returnURL:
            returnURL = url_for('portfolio.portfolio_home')
        email = request.form['email']
        username = request.form['username']
        password = request.form['password']
        error = None
        if not username:
            error = "Username is required."
        elif not password:
            error = "Password is required."
        elif not email:
            error = "Email is required."

        if error is None:
            if User.lookup(username):
                error = "Username already exists."
            elif not User.validate_password(password):
                error = "Invalid password."
            else:
                temp = User(email, username, password)
                temp.save()
                return redirect(url_for(returnURL))
        flash(error)
    elif request.method == 'GET':
        returnURL = request.args.get("returnURL")
        form.returnURL.data = returnURL

    if form.validate_on_submit():
        return "The form has been submitted. Success!"

    return render_template('register.html', form=form, site_key=os.environ.get('RECAPTCHA_PUBLIC_KEY'))



@auth_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        returnURL = request.form.get("returnURL")
        if not returnURL:
            returnURL = url_for('portfolio.portfolio_home')
        username = request.form['username']
        password = request.form['password']
        error = None
        if not User.lookup(username):
            error = "Incorrect username or password."
        elif not User.authenticate(username, password):
            error = 'Incorrect username or password.'

        if error is None:
            session.clear()
            session['user_id'] = User.id(username)
            return redirect(returnURL)
        flash(error)
    elif request.method == 'GET':
        returnURL = request.args.get("returnURL")
        form.returnURL.data = returnURL
    return render_template('login.html', form=form)

@auth_blueprint.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = User.lookupID(user_id)

@auth_blueprint.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('portfolio.portfolio_home'))

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            #TODO Fix flash() not appearing before redirect
            flash("Please log in or create an account to use/view this feature.")
            returnURL = request.url
            return redirect(url_for('auth.login', returnURL=returnURL))
        return view(**kwargs)
    return wrapped_view
