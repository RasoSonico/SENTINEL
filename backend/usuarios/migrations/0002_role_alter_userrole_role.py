# Generated by Django 5.2 on 2025-04-30 07:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(choices=[('ADMIN', 'Administrador'), ('INSPECTOR', 'Inspector'), ('INVERSIONISTA', 'Inversionista')], default='INSPECTOR', max_length=50)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Rol',
                'verbose_name_plural': 'Roles',
                'ordering': ['name'],
            },
        ),
        migrations.AlterField(
            model_name='userrole',
            name='role',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_roles', to='usuarios.role'),
        ),
    ]
