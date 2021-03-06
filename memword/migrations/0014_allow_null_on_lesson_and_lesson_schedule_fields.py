# Generated by Django 2.1 on 2019-01-22 20:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('memword', '0013_lessonschedule'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='expected_duration',
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='lessonschedule',
            name='last_generation_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='lessonschedule',
            name='preferred_time',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
