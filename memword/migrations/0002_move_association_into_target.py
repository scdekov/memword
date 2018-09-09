# Generated by Django 2.1 on 2018-08-25 15:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('memword', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='association',
            name='author',
        ),
        migrations.RemoveField(
            model_name='association',
            name='target',
        ),
        migrations.AddField(
            model_name='target',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='target',
            name='description',
            field=models.CharField(blank=True, max_length=1024),
        ),
        migrations.AddField(
            model_name='target',
            name='img_link',
            field=models.URLField(blank=True, max_length=512),
        ),
        migrations.DeleteModel(
            name='Association',
        ),
    ]