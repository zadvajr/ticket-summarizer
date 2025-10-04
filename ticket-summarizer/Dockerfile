FROM python:3.13-alpine

# switch working directory
WORKDIR /app

# copy the requirements file into the image
COPY ./requirements.txt .

# install the dependencies and packages in the requirements file
RUN pip install -r requirements.txt && pip install gunicorn

# copy every content from the local file to the image
COPY . .

CMD ["gunicorn","-b","0.0.0.0:8080","app:app"]