# Generated by Django 2.1 on 2018-09-08 09:05

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('memword', '0005_userlearningintervals'),
    ]

    operations = [
        migrations.AlterField(
            model_name='repetition',
            name='target',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repetitions', to='memword.Target'),
        ),
        migrations.AlterField(
            model_name='target',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='targets', to=settings.AUTH_USER_MODEL),
        ),
    ]
