import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0">&copy; {currentYear} Kiaalap. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">Built with <i className="bi bi-heart-fill text-danger"></i> for education</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
