# Generated by Django 5.2 on 2025-05-04 03:04

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('avance', '0003_alter_commitmenttracking_options_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PhysicalStatusHistory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('previous_status', models.CharField(blank=True, max_length=20, null=True)),
                ('new_status', models.CharField(max_length=20)),
                ('changed_at', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('physical', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='avance.physical')),
            ],
            options={
                'ordering': ['changed_at'],
            },
        ),
    ]
