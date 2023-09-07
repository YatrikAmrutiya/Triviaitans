import React, { useContext, useState, useEffect } from 'react';
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';
import { getUser, getUserStatistics } from '../../apis/ProfileAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

function Dashboard() {
  // State variables to hold user statistics
  const [totalPoints, setTotalPoints] = useState('');
  const [totalGames, setTotalGames] = useState('');
  const [pointsByCategory, setPointsByCategories] = useState('');
  const [firstQuestionAnswered, setFirstQuestionAnswered] = useState(false);
  const [firstQuestionAnsweredCorrectly, setFirstQuestionAnsweredCorrectly] = useState(false);

  // Access the user object from the Firebase authentication context
  // @ts-ignore
  const { user } = useContext(FirebaseAuthContext);

  // Fetch user statistics and achievements when the user object changes
  useEffect(() => {
    console.log(user);
    if (user != null) {
      // Fetch user statistics
      getUserStatistics().then((res) => {
        console.log(res);
        if (res.status === 200) {
          console.log("User Statistics Fetched Successfully: ");
          setTotalPoints(res.data.totalPoints);
          setTotalGames(res.data.totalGames);
          const pointsByCategory = res.data.pointsByCategory;
          console.log(pointsByCategory);
          setPointsByCategories(pointsByCategory);
        }
      }).catch((error) => {
        console.log(error);
      });

      // Fetch user achievements
      getUser().then((res) => {
        if (res.status === 200) {
          setFirstQuestionAnswered(res.data.firstQuestionAnswered);
          setFirstQuestionAnsweredCorrectly(res.data.firstQuestionAnsweredCorrectly);
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }, [user]);

  // Prepare chart data from pointsByCategory for Recharts BarChart
  const chartData = Object.keys(pointsByCategory).map((category) => ({
    category,
    points: pointsByCategory[category],
  }));

  return (
    <>
      {/* Dashboard content */}
      <div style={{ display: 'flex', height: '600px' }}>
        <div style={{ flex: 1 }}>
          {/* Display user welcome message */}
          <br></br><br></br>
          <p style={{ fontSize: '24px', width: '500px' }}>
            Welcome <strong style={{ color: '#05991d' }}>{user?.displayName}!!</strong>
          </p>
          <p style={{ fontSize: '18px' }}>You are now signed-in!</p>
          <br></br>
          {/* Display user achievements */}
          <div style={{ border: '2px solid black', paddingLeft: '15px' }}>
            <h3 style={{ color: '#1976d2' }}>Your Achievements are as follows:</h3>
            {firstQuestionAnswered && (
              <p style={{ fontWeight: 'bold' }}>🎖️ First Question Answered!!!!!</p>
            )}
            {firstQuestionAnsweredCorrectly && (
              <p style={{ fontWeight: 'bold' }}>🏅 First Question Answered Correctly!!!!</p>
            )}
          </div>
          <br></br>
          {/* Display user statistics */}
          <div style={{ border: '2px solid black', paddingLeft: '15px' }}>
            <h3 style={{ color: '#1976d2' }}>Your Statistics are as follows:</h3>
            <p>
              <span style={{ fontWeight: 'bold' }}>Total Games Played :</span> {totalGames}
            </p>
            <p>
              <span style={{ fontWeight: 'bold' }}>Total Points Earned :</span> {totalPoints}
            </p>
            <p style={{ fontWeight: 'bold' }}>Points by Category :</p>
            <ul>
              {Object.keys(pointsByCategory).map((category, index) => (
                <li key={index} style={{ marginBottom: '15px' }}>
                  <strong>{category}:</strong> {pointsByCategory[category]}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Display Recharts BarChart for points by category */}
        <div style={{ flex: 1, marginTop: '170px', height: '400px' }}>
          <BarChart width={600} height={400} data={chartData}>
            <XAxis dataKey="category" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Bar dataKey="points" fill="#1976d2" barSize={40} />
          </BarChart>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
