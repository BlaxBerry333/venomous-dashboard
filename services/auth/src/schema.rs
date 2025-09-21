// @generated automatically by Diesel CLI.

diesel::table! {
    auth_users (id) {
        id -> Uuid,
        user_id -> Uuid,
        email -> Varchar,
        password_hash -> Varchar,
        email_verified -> Bool,
        last_login -> Nullable<Timestamptz>,
        failed_login_attempts -> Int4,
        account_locked_until -> Nullable<Timestamptz>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    roles (id) {
        id -> Uuid,
        name -> Varchar,
        description -> Nullable<Text>,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        email -> Varchar,
        name -> Varchar,
        role_id -> Uuid,
        avatar -> Nullable<Text>,
        locale -> Varchar,
        timezone -> Nullable<Varchar>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::joinable!(auth_users -> users (user_id));
diesel::joinable!(users -> roles (role_id));

diesel::allow_tables_to_appear_in_same_query!(auth_users, roles, users);
