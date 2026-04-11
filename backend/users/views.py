import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


User = get_user_model()


def _parse_body(request):
    try:
        return json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        return None


@csrf_exempt
def register_api(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    username = str(payload.get("username", "")).strip()
    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", ""))

    if not username or not email or not password:
        return JsonResponse({"detail": "username, email, and password are required."}, status=400)

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({"detail": "Invalid email format."}, status=400)

    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({"detail": "Email already exists."}, status=409)

    try:
        validate_password(password)
    except ValidationError as exc:
        return JsonResponse(
            {
                "detail": " ".join(exc.messages),
                "errors": exc.messages,
            },
            status=400,
        )

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
    except IntegrityError:
        return JsonResponse({"detail": "Username is unavailable."}, status=409)

    login(request, user)
    return JsonResponse(
        {"user": {"id": user.id, "username": user.username, "email": user.email}},
        status=201,
    )


@csrf_exempt
def login_api(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body."}, status=400)

    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "Invalid username or password."}, status=401)

    login(request, user)
    return JsonResponse({"user": {"id": user.id, "username": user.username, "email": user.email}})


@csrf_exempt
def logout_api(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    logout(request)
    return JsonResponse({"detail": "Logged out."})


def me_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False})

    return JsonResponse(
        {
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            },
        }
    )