# Generated by Django 5.2 on 2025-05-04 19:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('avance', '0004_physicalstatushistory'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='physicalstatushistory',
            options={'ordering': ['changed_at'], 'verbose_name': 'Historial de Estatus de Avance', 'verbose_name_plural': 'Historial de Estatus de Avances'},
        ),
    ]
