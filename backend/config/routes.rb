Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  scope :api do
    scope module: :guest do
      resources :event_types, path: "event-types", param: :event_type_id, only: %i[index show]
      resources :slots, only: %i[index]
      resources :bookings, only: %i[create]
    end

    namespace :admin do
      resources :event_types, path: "event-types", param: :event_type_id, only: %i[index show create]
      resources :bookings, only: [] do
        collection do
          get :upcoming
        end
        member do
          post :cancel
        end
      end
      resources :schedule, only: %i[index]
      resource :settings, only: %i[show update]
    end
  end
end
