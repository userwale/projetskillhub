import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const res = await axios.get(`/api/courses/${courseId}`);
      setCourse(res.data);
    };
    fetchCourse();
  }, [courseId]);

  return (
    <div>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
      {/* Afficher le contenu du cours ici */}
    </div>
  );
};
