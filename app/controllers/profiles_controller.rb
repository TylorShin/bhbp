class ProfilesController < ApplicationController
  before_filter :authenticate_user!, only: [:show, :edit, :update]
  def index
    @profiles = User.all
    @sign_in = true if user_signed_in?
    respond_to do |format|
      format.html
      format.json { render json: @profiles, meta: { signIn: @sign_in } }
    end
  end

  def ownlist
    @profiles = current_user.following
    @sign_in = true if user_signed_in?
    render json: @profiles, meta: { signIn: @sign_in }
  end

  def show
    @user = User.find(params[:id])
    @follow = current_user.following?(@user)
    @request = current_user.request?(@user)
    @process = current_user.process?(@user) if @request
    @mine = true if @user == current_user
    respond_to do |format|
      format.html
      format.json { render json: @user, meta: { mine: @mine, following: @follow, request: @request, process: @process }}
    end
  end

  def edit
    @profile = Profile.find(params[:id])
    redirect_to root_path unless @profile == current_user.profile
  end

  def update
    @profile = current_user.profile
    if @profile.update(profile_params)
      redirect_to profile_path(@profile)
    else
      render 'edit'
    end
  end

  def follow
    @user = User.find_by(id: params[:user_id])
    current_user.follow(@user)
    @follow = current_user.following?(@user)
    @request = current_user.request?(@user)
    @process = current_user.process?(@user) if @request
    @mine = true if @user == current_user
    render json: @user, meta: { mine: @mine, following: @follow, request: @request, process: @process }
  end

  def unfollow
    @user = User.find(params[:user_id])
    current_user.unfollow(@user)
    @follow = current_user.following?(@user)
    @request = current_user.request?(@user)
    @process = current_user.process?(@user) if @request
    @mine = true if @user == current_user
    render json: @user, meta: { mine: @mine, following: @follow, request: @request, process: @process }
  end

  def sendrequest
    @receiver = User.find(params[:receiver_id])
    if current_user.request(@receiver)
      @follow = current_user.following?(@receiver)
      @request = current_user.request?(@receiver)
      @process = current_user.process?(@receiver) if @request
      @mine = true if @receiver == current_user
      render json: @receiver, meta: { mine: @mine, following: @follow, request: @request, process: @process }
    end
  end

  def unsendrequest
    @receiver = User.find(params[:receiver_id])
    if current_user.unrequest(@receiver)
      @follow = current_user.following?(@receiver)
      @request = current_user.request?(@receiver)
      @process = current_user.process?(@receiver) if @request
      @mine = true if @receiver == current_user
      render json: @receiver, meta: { mine: @mine, following: @follow, request: @request, process: @process }
    end
  end

  def search
    @search = Profile.where('username LIKE ?', "%#{params[:search]}%").limit(5) if params[:search].length > 0
    render json: @search
  end

  private

  def profile_params
    params.require(:profile).permit(:username, :region, :nation, :interest, :intro, :userimage)
  end
end
