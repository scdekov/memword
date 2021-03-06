# Generated by Django 2.1 on 2018-09-08 11:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import memword.models.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('memword', '0006_add_related_names'),
    ]

    operations = [
        migrations.CreateModel(
            name='Lesson',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lesson_type', models.CharField(choices=[('lecture', 'Lecture'), ('exam', 'Exam')], max_length=32)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('expected_duration', models.DurationField()),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('passed', models.BooleanField(default=False)),
                ('correct', models.NullBooleanField()),
                ('confidence_level', memword.models.fields.ConfidenceLevelField(help_text='This should be between 1 and 10', null=True)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='memword.Lesson')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='memword.Target')),
            ],
        ),
        migrations.AlterField(
            model_name='repetition',
            name='confidence_level',
            field=memword.models.fields.ConfidenceLevelField(help_text='This should be between 1 and 10', null=True),
        ),
        migrations.AlterField(
            model_name='repetition',
            name='source_type',
            field=models.CharField(choices=[('exam', 'Exam'), ('notification', 'Notification'), ('lesson', 'Lesson')], max_length=12),
        ),
        migrations.AddField(
            model_name='lesson',
            name='questions',
            field=models.ManyToManyField(related_name='lesson_questions', through='memword.Question', to='memword.Target'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='student',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='lessons', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='question',
            unique_together={('lesson', 'target')},
        ),
    ]
