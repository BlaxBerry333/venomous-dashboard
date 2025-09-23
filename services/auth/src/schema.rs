// @generated automatically by Diesel CLI.

diesel::table! {
    auth_users (id) {
        id -> Uuid,
        user_id -> Uuid,
        email -> Varchar,
        password_hash -> Varchar,
        email_verified -> Bool,
        last_login -> Nullable<Timestamptz>,
        login_failure_count -> Int4,
        is_login_locked -> Bool,
        deleted_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    roles (id) {
        id -> Uuid,
        name -> Varchar,
        description -> Nullable<Text>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        deleted_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        email -> Varchar,
        name -> Varchar,
        avatar_path -> Nullable<Text>,
        role_id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        deleted_at -> Nullable<Timestamptz>,
    }
}

diesel::joinable!(auth_users -> users (user_id));
diesel::joinable!(users -> roles (role_id));

diesel::allow_tables_to_appear_in_same_query!(auth_users, roles, users);
