import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'
import { useNavigate } from 'react-router-dom';

/*const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://flight-backend-auda.onrender.com';*/

import API from '../api'

const RevenueOverviewChart = () => {
  return (
    <div style={{ width: '100%', height: '260px', marginTop: '16px', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '22px', left: '48%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', zIndex: 10 }}>
        $635 <span style={{ color: '#94a3b8', fontWeight: '500', marginLeft: '2px' }}>12 Jul</span>
      </div>
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <svg viewBox="0 0 600 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />
          <line x1="0" y1="160" x2="600" y2="160" stroke="#e2e8f0" />
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <path
            d="M 10,110 C 60,110 50,125 100,125 C 150,125 140,85 200,85 C 250,85 240,40 290,40 C 340,40 350,105 400,105 C 450,105 440,75 500,75 C 550,75 540,100 590,100 L 590,160 L 10,160 Z"
            fill="url(#chartGradient)"
          />
          <path
            d="M 10,110 C 60,110 50,125 100,125 C 150,125 140,85 200,85 C 250,85 240,40 290,40 C 340,40 350,105 400,105 C 450,105 440,75 500,75 C 550,75 540,100 590,100"
            fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round"
          />
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 0 4px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
          <span key={idx} style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', width: '60px', textAlign: 'center' }}>
            {day}
          </span>
        ))}
      </div>
    </div>
  )
}

const MiniCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateData, setSelectedDateData] = useState(null)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array(firstDay).fill(null)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getBookingsForDay = (day) => {
    return bookings.filter((booking) => {
      if (!booking.booking_date) return false
      const bookingDate = new Date(booking.booking_date)
      return bookingDate.getDate() === day && bookingDate.getMonth() === month && bookingDate.getFullYear() === year
    })
  }

  const isToday = (day) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>Calendar</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>{'<'}</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>{'>'}</button>
        </div>
      </div>
      <p style={{ color: '#64748b', fontSize: '13px', marginTop: 0, marginBottom: '16px' }}>{monthNames[month]} {year}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
        {daysOfWeek.map((day, idx) => (
          <div key={idx} style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{day}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {blanks.map((_, idx) => <div key={`blank-${idx}`} style={{ padding: '8px 0' }}></div>)}
        {daysArray.map((day) => {
          const dayBookings = getBookingsForDay(day)
          const todayDate = isToday(day)
          return (
            <button
              key={day}
              onClick={() => setSelectedDateData({ date: `${day} ${monthNames[month]} ${year}`, bookings: dayBookings })}
              style={{ padding: '8px 0', fontSize: '13px', fontWeight: '700', color: todayDate ? '#fff' : '#334155', background: todayDate ? '#3b82f6' : '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', position: 'relative' }}
            >
              {day}
              {dayBookings.length > 0 && (
                <span style={{ width: '5px', height: '5px', background: todayDate ? '#fff' : '#3b82f6', borderRadius: '50%', position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)' }}></span>
              )}
            </button>
          )
        })}
      </div>
      {selectedDateData && (
        <div style={{ marginTop: '18px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <h4 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{selectedDateData.date}</h4>
          {selectedDateData.bookings.length > 0 ? (
            selectedDateData.bookings.map((booking) => (
              <div key={booking.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', marginBottom: '8px' }}>
                <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{booking.passenger_name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>PNR: {booking.pnr_number || 'N/A'} | {booking.status}</p>
              </div>
            ))
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No bookings found for this date.</p>
          )}
        </div>
      )}
    </div>
  )
}

const MessagesPanel = ({ users, messages, currentUser, onOpenChat }) => {
  const getMessagesWithUser = (otherUserId) => {
    return messages.filter((msg) =>
      (Number(msg.sender) === Number(currentUser.id) && Number(msg.receiver) === Number(otherUserId)) ||
      (Number(msg.receiver) === Number(currentUser.id) && Number(msg.sender) === Number(otherUserId))
    )
  }

  const getLastMessage = (otherUserId) => {
    const chatMessages = getMessagesWithUser(otherUserId)
    if (chatMessages.length === 0) return 'No messages yet'
    return chatMessages[chatMessages.length - 1].text
  }

  const getUnreadCount = (otherUserId) => {
    return messages.filter((msg) =>
      Number(msg.sender) === Number(otherUserId) &&
      Number(msg.receiver) === Number(currentUser.id) &&
      msg.is_read === false
    ).length
  }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>Messages</h3>
        <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>Agents</span>
      </div>
      {users.length > 0 ? (
        users.map((chatUser) => {
          const unreadCount = getUnreadCount(chatUser.id)
          return (
            <div key={chatUser.id} onClick={() => onOpenChat(chatUser)} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{chatUser.username}</strong>
                {unreadCount > 0 && (
                  <span style={{ background: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: '700', borderRadius: '999px', padding: '2px 7px' }}>{unreadCount}</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getLastMessage(chatUser.id)}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>{chatUser.role}</p>
            </div>
          )
        })
      ) : (
        <p style={{ color: '#64748b', fontSize: '13px' }}>No users found.</p>
      )}
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [exchangesCount, setExchangesCount] = useState(0)
  const [refundsCount, setRefundsCount] = useState(0)
  const [creditsCount, setCreditsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)
  
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    passenger_name: '',
    passenger_email: '',
    pnr_number: '',
    seats_booked: 0,
    total_amount: 0,
    status: 'Pending'
  })

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChatUser, setSelectedChatUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null);
const [bookingForm, setBookingForm] = useState({
  passenger_name: '',
  passenger_email: '',
  pnr_number: '',
  seats_booked: '',
  total_amount: '',
  status: 'Pending'
});

  const fetchDashboardData = async () => {
    try {
      const bookingsRes = await axios.get(`${API_BASE_URL}/api/bookings/`).catch(err => { console.error("Bookings fetch failed:", err); return { data: [] }; });
      const exchangesRes = await axios.get(`${API_BASE_URL}/api/exchanges/`).catch(() => ({ data: [] }));
      const refundsRes = await axios.get(`${API_BASE_URL}/api/refunds/`).catch(() => ({ data: [] }));
      const creditsRes = await axios.get(`${API_BASE_URL}/api/future-credits/`).catch(() => ({ data: [] }));

      let bookingsData = bookingsRes.data || [];
      let exchangesData = exchangesRes.data || [];
      let refundsData = refundsRes.data || [];
      let creditsData = creditsRes.data || [];

      if (user?.role === 'agent') {
        bookingsData = bookingsData.filter(booking => Number(booking.agent) === Number(user.id));
        exchangesData = exchangesData.filter(exchange => Number(exchange.agent) === Number(user.id));
        refundsData = refundsData.filter(refund => Number(refund.agent) === Number(user.id));
        creditsData = creditsData.filter(credit => Number(credit.agent) === Number(user.id));
      }

      setBookings(bookingsData);
      setExchangesCount(exchangesData.length);
      setRefundsCount(refundsData.length);
      setCreditsCount(creditsData.length);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard critical error:', error);
      setLoading(false);
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/`)
      setUsers(response.data.filter((u) => Number(u.id) !== Number(user.id)))
    } catch (error) {
      console.error('Users fetch error:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages/?user_id=${user.id}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Messages fetch error:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUsers()
      fetchMessages()
    }
  }, [user])

  const handleSelectBookingClick = (booking) => {
    setSelectedBooking(booking);
    setBookingForm({
      passenger_name: booking.passenger_name || '',
      passenger_email: booking.passenger_email || '',
      pnr_number: booking.pnr_number || '',
      seats_booked: booking.seats_booked || 0,
      total_amount: booking.total_amount || 0,
      status: booking.status || 'Pending'
    });
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/api/bookings/${selectedBooking.id}/`, bookingForm);
      if (response.status === 200 || response.status === 201) {
        alert('Booking successfully updated!');
        setSelectedBooking(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed operational data update:', error.response?.data || error.message);
      alert('Error updating custom fields.');
    }
  };

  const sendMessage = async () => {
    if (!selectedChatUser || !newMessage.trim()) return
    try {
      await axios.post(`${API_BASE_URL}/api/messages/`, {
        sender: user.id,
        receiver: selectedChatUser.id,
        text: newMessage,
        is_read: false,
      })
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message)
      alert('Message not sent.')
    }
  }
  const handleUpdateBooking = async () => {
  try {
    await axios.put(`${API_BASE_URL}/api/bookings/${selectedBooking.id}/`, bookingForm);
    alert('Booking updated successfully!');
    setSelectedBooking(null);
    fetchDashboardData(); // Data refresh karne ke liye
  } catch (error) {
    console.error('Update error:', error);
    alert('Failed to update booking.');
  }
};
  const selectedChatMessages = selectedChatUser
    ? messages.filter((msg) =>
        (Number(msg.sender) === Number(user.id) && Number(msg.receiver) === Number(selectedChatUser.id)) ||
        (Number(msg.receiver) === Number(user.id) && Number(msg.sender) === Number(selectedChatUser.id))
      )
    : []

  const agentSummary = Object.values(
    bookings.reduce((acc, booking) => {
      const key = booking.agent_email || booking.agent_name || 'unknown'
      if (!acc[key]) {
        acc[key] = {
          agent_name: booking.agent_name || 'Unknown Agent',
          agent_email: booking.agent_email || 'No Email',
          agent_role: booking.agent_role || 'Agent',
          total_bookings: 0,
          authorized_bookings: 0,
          unauthorized_bookings: 0,
          transactions: [],
        }
      }
      acc[key].total_bookings += 1
      if (booking.is_authorized) acc[key].authorized_bookings += 1
      else acc[key].unauthorized_bookings += 1
      acc[key].transactions.push(booking)
      return acc
    }, {})
  )

  const recentTransactions = bookings.filter((booking) => {
    if (!booking.booking_date) return false;
    const bookingTime = new Date(booking.booking_date).getTime();
    const now = new Date().getTime();
    return bookingTime >= now - 24 * 60 * 60 * 1000 && bookingTime <= now;
  });

  return (
    <Layout>
      <div style={{ padding: '32px 40px', backgroundColor: '#f4f7f9', minHeight: '100%', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0' }}>Dashboard</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              {user?.role === 'manager' ? 'Manager overview of all CRM operations' : 'Overview of your flight operations'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(280px, 1fr)', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Total Bookings</p>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800' }}>{loading ? '...' : bookings.length}</h3>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Total Exchanges</p>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800' }}>{loading ? '...' : exchangesCount}</h3>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Total Refunds</p>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800' }}>{loading ? '...' : refundsCount}</h3>
              </div>
            </div>

            {/* REVENUE CHART */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>Revenue Overview</h3>
              <RevenueOverviewChart />
            </div>

            {/* RECENT TRANSACTIONS */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>Recent Transactions (Last 24 Hours)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>PNR</th>
                      <th style={{ padding: '12px 16px' }}>Customer</th>
                      <th style={{ padding: '12px 16px' }}>Type</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '16px', fontWeight: '700', color: '#3b82f6', fontSize: '13px' }}>{b.pnr_number || 'N/A'}</td>
                          <td style={{ padding: '16px', color: '#334155', fontWeight: '600', fontSize: '13px' }}>{b.passenger_name}</td>
                          <td style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Booking</td>
                          <td style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: b.status === 'Confirmed' ? '#dcfce7' : '#fef3c7', color: b.status === 'Confirmed' ? '#166534' : '#92400e' }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '20px', color: '#64748b' }}>No transactions in the last 24 hours.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CUSTOMER BOOKING TABLE */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                {user?.role === 'manager' ? 'Agent Credentials & Past Data' : 'Customer Booking Information'}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    {user?.role === 'manager' ? (
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>SR No.</th>
                        <th style={{ padding: '12px 16px' }}>Agent Name</th>
                        <th style={{ padding: '12px 16px' }}>Email</th>
                        <th style={{ padding: '12px 16px' }}>Authorization</th>
                        <th style={{ padding: '12px 16px' }}>Role</th>
                        <th style={{ padding: '12px 16px' }}>Total Bookings</th>
                        <th style={{ padding: '12px 16px' }}>Past Transactions</th>
                      </tr>
                    ) : (
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>SR No.</th>
                        <th style={{ padding: '12px 16px' }}>Customer Name</th>
                        <th style={{ padding: '12px 16px' }}>PNR</th>
                        <th style={{ padding: '12px 16px' }}>Authorization</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Action</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {user?.role === 'manager' ? (
                      loading ? (
                        <tr><td colSpan="7" style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Loading agent data...</td></tr>
                      ) : agentSummary.length > 0 ? (
                        agentSummary.map((agent, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '16px', color: '#334155', fontSize: '13px' }}>{index + 1}</td>
                            <td style={{ padding: '16px', color: '#334155', fontWeight: '600', fontSize: '13px' }}>{agent.agent_name}</td>
                            <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>{agent.agent_email}</td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#166534', width: 'fit-content' }}>Authorized: {agent.authorized_bookings}</span>
                                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#fee2e2', color: '#991b1b', width: 'fit-content' }}>Not Authorized: {agent.unauthorized_bookings}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>{agent.agent_role}</td>
                            <td style={{ padding: '16px', color: '#334155', fontWeight: '700', fontSize: '13px' }}>{agent.total_bookings}</td>
                            <td style={{ padding: '16px' }}>
                              <button className="table-action-btn" onClick={() => setSelectedAgent(agent)}>View Details</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="7" style={{ padding: '20px', color: '#64748b' }}>No agent data found.</td></tr>
                      )
                    ) : (
                      bookings.length > 0 ? (
                        bookings.map((b, index) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '16px', color: '#334155', fontSize: '13px' }}>{index + 1}</td>
                            <td style={{ padding: '16px', color: '#334155', fontWeight: '600', fontSize: '13px' }}>{b.passenger_name}</td>
                            <td style={{ padding: '16px', color: '#3b82f6', fontWeight: '700', fontSize: '13px' }}>{b.pnr_number || 'N/A'}</td>
                            <td style={{ padding: '16px' }}>
                              {b.is_authorized ? (
                                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#166534' }}>Authorized</span>
                              ) : (
                                <div>
                                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#fee2e2', color: '#991b1b', display: 'inline-block', marginBottom: '6px' }}>Not Authorized</span>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', maxWidth: '180px' }}>Click "I Authorize" in registered email</div>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: b.status === 'Confirmed' ? '#dcfce7' : '#fef3c7', color: b.status === 'Confirmed' ? '#166534' : '#92400e' }}>
                                {b.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                             <button 
  className="table-action-btn" 
  onClick={() => { 
    setSelectedBooking(b); // Yeh line modal khol degi
    setBookingForm(b);     // Yeh line modal mein pura data bhar degi
  }}
>
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="7" style={{ padding: '20px', color: '#64748b' }}>No customer bookings found.</td></tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MiniCalendar bookings={bookings} />
            <MessagesPanel users={users} messages={messages} currentUser={user} onOpenChat={setSelectedChatUser} />
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>Future Credits</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Total issued: {loading ? '...' : creditsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AGENT MODAL */}
      {selectedAgent && (
        <div className="details-modal-overlay">
          <div className="details-modal">
            <div className="details-modal-header">
              <div>
                <h3>Agent Transaction Details</h3>
                <p>{selectedAgent.agent_name}</p>
              </div>
              <button className="details-close-btn" onClick={() => setSelectedAgent(null)}>✕</button>
            </div>
            <div className="details-agent-info">
              <p><strong>Agent Name:</strong> {selectedAgent.agent_name}</p>
              <p><strong>Email:</strong> {selectedAgent.agent_email}</p>
              <p><strong>Role:</strong> {selectedAgent.agent_role}</p>
              <p><strong>Total Bookings:</strong> {selectedAgent.total_bookings}</p>
            </div>
            <div className="details-transaction-list">
              {selectedAgent.transactions.length > 0 ? (
                selectedAgent.transactions.map((t, index) => (
                  <div className="details-transaction-card" key={index}>
                    <h4>Transaction {index + 1}</h4>
                    <p><strong>Passenger:</strong> {t.passenger_name}</p>
                    <p><strong>PNR:</strong> {t.pnr_number || 'N/A'}</p>
                    <p><strong>Email:</strong> {t.passenger_email || 'Not Provided'}</p>
                    <p><strong>Status:</strong> {t.status}</p>
                    <p><strong>Date:</strong> {new Date(t.booking_date).toLocaleString()}</p>
                    <button
                      className="table-action-btn"
                      style={{ marginTop: '10px' }}
                      onClick={() => {
                        setSelectedAgent(null);
                        handleSelectBookingClick(t);
                      }}
                    >
                      View & Edit Details
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No transactions found for this agent.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAILS & EDIT MODAL */}
      {selectedBooking && (
        <div className="details-modal-overlay">
          <div className="details-modal">
            <div className="details-modal-header">
              <div>
                <h3>Customer Booking Details</h3>
                <p>{selectedBooking.passenger_name}</p>
              </div>

              <button className="details-close-btn" onClick={() => setSelectedBooking(null)}>
                ✕
              </button>
            </div>

            <div className="details-agent-info">
              <p><strong>Passenger:</strong> {selectedBooking.passenger_name}</p>
              <p><strong>PNR:</strong> {selectedBooking.pnr_number || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedBooking.passenger_email || 'Not Provided'}</p>
              <p><strong>Seats Booked:</strong> {selectedBooking.seats_booked || 'Not Provided'}</p>
              <p><strong>Total Amount:</strong> {selectedBooking.total_amount || 'Not Provided'}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>Date:</strong> {new Date(selectedBooking.booking_date).toLocaleString()}</p>
            </div>

            {selectedBooking.status === 'Confirmed' ? (
              <div className="confirmed-box" style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginTop: '14px' }}>
                 This booking is already confirmed.
              </div>
            ) : (
              <div className="confirm-form-box" style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: '#0f172a' }}>Complete Booking Confirmation</h4>

                <div className="confirm-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div className="confirm-form-field">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Passenger Name</label>
                    <input
                      type="text"
                      value={bookingForm.passenger_name}
                      onChange={(e) => setBookingForm({ ...bookingForm, passenger_name: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      placeholder="Passenger name"
                    />
                  </div>

                  <div className="confirm-form-field">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Passenger Email</label>
                    <input
                      type="email"
                      value={bookingForm.passenger_email}
                      onChange={(e) => setBookingForm({ ...bookingForm, passenger_email: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      placeholder="Passenger email"
                    />
                  </div>

                  <div className="confirm-form-field">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>PNR Number</label>
                    <input
                      type="text"
                      value={bookingForm.pnr_number}
                      onChange={(e) => setBookingForm({ ...bookingForm, pnr_number: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      placeholder="PNR number"
                    />
                  </div>

                  <div className="confirm-form-field">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Seats Booked</label>
                    <input
                      type="number"
                      value={bookingForm.seats_booked}
                      onChange={(e) => setBookingForm({ ...bookingForm, seats_booked: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      placeholder="Seats booked"
                    />
                  </div>

                  <div className="confirm-form-field">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Total Amount</label>
                    <input
                      type="number"
                      value={bookingForm.total_amount}
                      onChange={(e) => setBookingForm({ ...bookingForm, total_amount: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      placeholder="Total amount"
                    />
                  </div>

                  <div className="confirm-form-field">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Status</label>
                    <select
                      value={bookingForm.status}
                      onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="confirm-booking-btn" 
                  onClick={handleUpdateBooking}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Update & Confirm Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedChatUser && (
        <div className="details-modal-overlay">
          <div className="details-modal">
            <div className="details-modal-header">
              <div>
                <h3>Chat with {selectedChatUser.username}</h3>
                <p>{selectedChatUser.email}</p>
              </div>
              <button className="details-close-btn" onClick={() => setSelectedChatUser(null)}>✕</button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '12px', marginBottom: '14px' }}>
              {selectedChatMessages.length > 0 ? (
                selectedChatMessages.map((msg) => {
                  const isMine = Number(msg.sender) === Number(user.id)
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                      <div style={{ maxWidth: '75%', padding: '10px 12px', borderRadius: '12px', background: isMine ? '#3b82f6' : '#ffffff', color: isMine ? '#ffffff' : '#334155', border: isMine ? 'none' : '1px solid #e2e8f0', fontSize: '13px' }}>
                        {msg.text}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No messages yet.</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
              />
              <button className="table-action-btn" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Dashboard