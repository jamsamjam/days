from django.contrib import admin

from .models import Habit, Row, Check

admin.site.register(Row)
admin.site.register(Habit)
admin.site.register(Check)